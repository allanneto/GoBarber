import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore, format, subHours } from 'date-fns'; // importando apenas o que é essencial para utilizarmos
import pt from 'date-fns/locale/pt';
import User from '../models/user';
import File from '../models/file';
import Appointment from '../models/appointment';
import Notification from '../schemas/Notification';
import Queue from '../../lib/Queue';
import CancellationMail from '../jobs/CancellationMail';

// import Mail from '../../lib/Mail'; -- Essa linha foi substituida pelo import da fila

class AppointmentController {
  async index(req, res) {
    const { page = 1 } = req.query; // recebendo o query = page do
    // criando a lista de appointments
    const appointments = await Appointment.findAll({
      where: { user_id: req.userId, canceled_at: null }, // buscando todos os appointments do usuario logado
      order: ['date'], // ordenando por data
      attributes: ['id', 'date', 'past', 'cancelable'], // mostrando somente o id e a data
      limit: 20, // setando o limite de appointments por pagina que sera mostrado
      offset: (page - 1) * 20, // estaremos recebendo a pagina que foi informada noq uery, diminuir um e multiplicar pelo numero que colocamos de limit de itens por pagina
      include: [
        // iremos incluir relacionamentos com outros DB
        {
          model: User,
          as: 'provider',
          attributes: ['id', 'name'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'url'],
            },
          ],
        },
      ],
    });

    return res.json(appointments);
  }

  async store(req, res) {
    // iremos definir um schema de validsação
    const schema = Yup.object().shape({
      provider_id: Yup.number().required(),
      date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation Fails' });
    }

    const { provider_id, date } = req.body;

    /**
     * Check if provider_id is a provider
     */
    const isProvider = await User.findOne({
      where: { id: provider_id, provider: true },
    });

    if (!isProvider) {
      return res
        .status(401)
        .json({ error: 'You can only create appointments with providers' });
    }

    /**
     * Check if provider_id equal to req.userId
     */

    if (req.userId === provider_id) {
      return res
        .status(400)
        .json({ error: 'You cant create an appointment with yourself' });
    }

    /**
     * Check for past dates
     */

    const hourStart = startOfHour(parseISO(date)); // Aqui o formato da data que informamos no insomnia é convertido e as horas sao pegas apenas o inicio dela, ex: 19:30, sera considerado apenas 19!

    if (isBefore(hourStart, new Date())) {
      // estamos verificando se a hora de inico é antes que a hora que é no momento.
      return res.status(400).json({ error: 'Past dates are no permitted' });
    }

    /**
     * Check date availability
     */

    const checkAvailability = await Appointment.findOne({
      where: {
        provider_id,
        canceled_at: null,
        date: hourStart,
      },
    });

    if (checkAvailability) {
      return res
        .status(400)
        .json({ error: 'Appointment date is not availabe' });
    }

    const appointment = await Appointment.create({
      user_id: req.userId,
      provider_id, // estava provider_id: req.body
      date,
    });

    /**
     * Notify appointment provider
     */

    const user = await User.findByPk(req.userId);
    const formatedDate = format(
      // importamos o metodo format do date fns para formatar a data e mostramos na tela do jeito que desejamos.
      hourStart,

      "'dia' dd 'de' MMMM', às' H:mm'h'",
      { locale: pt }
    );

    // eslint-disable-next-line no-undef
    await Notification.create({
      // nos iremos colocar a notificacao inteira com conteudo e nao iremos fazer os relacionamentos, no banco nao relacional e bom algumas coisas nao manter o relacionamento, ex em um chat caso o usuario envie uma mensagem hoje e no final da tarde ele troque o nome de usuario e o nome dele a mensagem que foi enviada no inicio do dia estaram com as informacoes antes de antes nao serao atualizadas pois ja foi salvo dessa forma no banco nao relacionals
      content: `Novo agendamento de ${user.name} para o ${formatedDate} `,
      user: provider_id,
    });

    return res.json(appointment);
  }

  async delete(req, res) {
    const appointment = await Appointment.findByPk(req.params.id, {
      // estamos incluindo os dados do provider puxando a partir do model user as provider
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['name', 'email'],
        },
        {
          model: User,
          as: 'user',
          attributes: ['name'],
        },
      ],
    });

    /**
     * Check if user logged in application is the appointment owner.
     * Only appointment's owner can delete it.
     */

    if (appointment.user_id !== req.userId) {
      return res.status(400).json({
        error: "You can't have permission to cancel this appointment.",
      });
    }

    /**
     * check if the current time is before 2 o'clock
     */

    const dateWithSub = subHours(appointment.date, 2); // importamos o metodo subhours que subtrai uma quantidade de horas de determinado horario, o parametro 1 e o horario (appointment,date nao precisa do parseIDO pois vem do BD no formato de hora ja) e o segundo paramentro sao a quantidade de horas a serem subtraidas.

    if (isBefore(dateWithSub, new Date())) {
      // verificando se date with sub que e a hora do appointment subtraindo 2 horas e mais cewdo que o horario atual
      return res.status(401).json({
        error: ' You can only only cancel the appointment 2 hours in advance',
      });
    }

    appointment.canceled_at = new Date(); // aqui estamos setando o horario de cancelamento do appointment caso ele passe por todas as verificacoes.

    await appointment.save(); // salvando as informacoes atualizadas no bd.

    // await Mail.sendMail({
    //   to: `${appointment.provider.name} <${appointment.provider.email}>`, // dados do destinatario do email primeiro parametro nome, segundo email entre os sinais <>
    //   subject: 'Agendamento Cancelado',
    //   // text: 'Voce tem um novo cancelamento', - Essa linha foi substituida pela linha template abaixo
    //   template: 'cancellation', // indicando qual arquivo de template estamos utilizando
    //   context: {
    //     // iremos informar todas as variaveis que serao utilizadas nos templates
    //     provider: appointment.provider.name, // recebendo nome do provider
    //     user: appointment.user.name, // recebendo nome do cliente,
    //     date: format(appointment.date, "'dia' dd 'de' MMMM', às' H:mm'h'", {
    //       // estamos recebdno a data do appointment.date e formatando a data para ser inserida na tela.

    //       locale: pt,
    //     }),
    //   },
    // });

    /**
     * Todo o codigo acima foi movido para o job cancellationmail na pasta jobs.
     */

    // o primeiro parametro de add sera a referencia a nossa chave, o segundo serao os dados do appointment dentro de um objeto.
    await Queue.add(CancellationMail.key, {
      appointment,
    });

    return res.json(appointment);
  }
}

export default new AppointmentController();

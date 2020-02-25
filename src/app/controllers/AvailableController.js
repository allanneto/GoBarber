import {
  startOfDay,
  endOfDay,
  setHours,
  setMinutes,
  setSeconds,
  format,
  isAfter,
} from 'date-fns';
import { Op } from 'sequelize';
import Appointment from '../models/appointment';

class AvailableController {
  async index(req, res) {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Invalid date.' });
    }

    // const searchDate = parseInt(date) metodo alternativo de transformar a data em numero  inteiro
    const searchDate = Number(date); // transformando a data que foi desestruturada acima em numero inteiro

    /**
     * Procurando por uma data especifica dentro do banco de dados
     */

    const appointments = await Appointment.finddAll({
      // iremos procurando dentro dos appointments as datas vagas para determindo provider
      where: {
        provider_id: req.params.providerId,
        canceled_at: null,
        date: {
          [Op.between]: [startOfDay(searchDate), endOfDay(searchDate)],
        },
      },
    });

    const schedule = [
      // variavel que contem todos os horarios disponiveis de um provider.
      '08:00',
      '09:00',
      '10:00',
      '11:00',
      '12:00',
      '13:00',
      '14:00',
      '15:00',
      '16:00',
      '17:00',
      '18:00',
      '23:00',
    ];

    // o available ira retornar as datas disponiveis para o usuario.
    const available = schedule.map(time => {
      // iremos verificar se o horario ja passou e se o horario nao esta reservado ja

      const [hour, minute] = time.split(':'); // estamos desestruturando a hora e o minuto de cada hora informada no schedule, o split separa o que estiver antes dos : e armazena em hour, e o que estiver depois em minute.

      // estamos formando as datas na variavel value no formato 08:00:00 por isso informamos na sintaxe abaixo:
      const value = setSeconds(
        setMinutes(setHours(searchDate, hour), minute),
        0
      );

      return {
        // iremos retornar um json com as informacoes de horarios disponiveis
        time,
        value: format(value, "yyyy-MM-dd'T'HH:mm:ssxxx"), // aqui estamos formatando o jeito de exibir a variavel value com o metodo format, recendo value no primeiro parametro e no segundo as configurações de exibição
        // iremos fazer verificações antes de mostrar os horarios na tela.
        available:
          isAfter(value, new Date()) && // isAfter verifica se o horario ira acontecer depois do horario atual
          !appointments.find(a => format(a.date, 'HH:mm') === time), // estamos verificando se as datas informadas estao sendo utilizadas no nosso bd
      };
    });

    return res.json(available);
  }
}
export default new AvailableController();

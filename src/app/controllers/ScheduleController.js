import { startOfDay, endOfDay, parseISO } from 'date-fns';
import { Op } from 'sequelize';
import Appointment from '../models/appointment';
import User from '../models/user';

class ScheduleController {
  // Iremos criar a lista de appointments do provider
  async index(req, res) {
    const checkUserProvider = await User.findOne({
      where: { id: req.userId, provider: true }, // procurando se o Id enviado se refere a um usuario que é provider
    });

    if (!checkUserProvider) {
      return res.json({ error: 'User is not a provider' });
    }

    // Precisamos pegar os appointments dentro do intervalo das horas do dia
    // 2019-09-05 00:00:00 - startOfDay
    // 2019-09-05 23:59:59 - endOfDay

    const { date } = req.query; // estamos pegando a data que foi informada nos querys da requisicao
    const parsedDate = parseISO(date); // pegando o incio da hora informada

    const appointments = await Appointment.findAll({
      where: {
        provider_id: req.userId,
        canceled_at: null,
        date: {
          [Op.between]: [
            // necessita colocar em volta de colchetes pois e uma variavel que vai ser setada como nome dentro do objeto
            // o Op.between e uma variavel de comparaca entao devemos enviar os parametros para saber o que existe entre aquelas datas
            startOfDay(parsedDate),
            endOfDay(parsedDate),
          ],
        },
      },
      order: ['date'],
    });

    return res.json(appointments);
  }
}

export default new ScheduleController();

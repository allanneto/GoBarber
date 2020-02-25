import Notification from '../schemas/Notification';
import User from '../models/user';

class NotificationController {
  async index(req, res) {
    const checkIsProvider = await User.findOne({
      where: { id: req.userId, provider: true },
    });

    if (!checkIsProvider) {
      return res
        .status(401)
        .json({ error: 'Only providers load notifications' });
    }

    const notifications = await Notification.find({
      // o mongo nao utiliza os metodos findAll ou findByPk, so temos acesso ao find/findOne
      // estamos procurando as notifications onde user for igual a req.userId
      user: req.userId,
    }) // e apartir desse ponto iremos concatenar metodos, sort para ordenar e limit para limit de notificacoes informadas
      .sort({
        createdAt: 'desc',
      })
      .limit(20);
    return res.json(notifications);
  }

  async update(req, res) {
    // Iremos marcar a notificacao como lida no nosso BD, para isso utilizaremos o metodo findByIdAndUpdate que encontrara o registro e ira atualizar ele ao mesmo tempo.
    const notification = await Notification.findByIdAndUpdate(
      req.params.id, // parametro para buscar o Id
      { read: true }, // atualizar o campo read para true
      { new: true } // opções adcionais, nesse caso apos atualizar ele vai informar a nova notificacao atualizada para listar pro usuario.
    );

    return res.json(notification);
  }
}

export default new NotificationController();

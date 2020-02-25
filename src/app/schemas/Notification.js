import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema(
  {
    // variavel onde iremos inserir os itens que irao no schema da notoification
    content: {
      // conteudo da notificacao
      type: String,
      required: true,
    },
    user: {
      type: Number,
      required: true,
    },
    read: {
      // a notificação ira constar como lida assim que o usuario clicar nela
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Notification', NotificationSchema);

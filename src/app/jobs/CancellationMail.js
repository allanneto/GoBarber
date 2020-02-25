import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Mail from '../../lib/Mail';

class CancellationMail {
  // fazendo o get key e como se estivesse decvlrando uma variavel key
  get key() {
    return 'CancellationMail'; // retornando uma chave unica, nesse caso o mesmo nome da classe.
  }

  /**
   * As informacoes do appointmente serao recebidas no parametro do handle
   */
  // handle tarefa que sera executada quando esse processo for executado

  async handle({ data }) {
    const { appointment } = data; // estaremos desestruturando o appointment que esta dentro de data

    await Mail.sendMail({
      to: `${appointment.provider.name} <${appointment.provider.email}>`, // dados do destinatario do email primeiro parametro nome, segundo email entre os sinais <>
      subject: 'Agendamento Cancelado',
      // text: 'Voce tem um novo cancelamento', - Essa linha foi substituida pela linha template abaixo
      template: 'cancellation', // indicando qual arquivo de template estamos utilizando
      context: {
        // iremos informar todas as variaveis que serao utilizadas nos templates
        provider: appointment.provider.name, // recebendo nome do provider
        user: appointment.user.name, // recebendo nome do cliente,
        date: format(
          parseISO(appointment.date),
          "'dia' dd 'de' MMMM', às' H:mm'h'",
          {
            // estamos recebdno a data do appointment.date e formatando a data para ser inserida na tela.

            locale: pt,
          }
        ),
      },
    });
  }
}

export default new CancellationMail();

// import CancellationMail from '..'
// ele conseguira utilizar CancellationMail.key sem ter que chamar o metodo key()

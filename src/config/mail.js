export default {
  // as propriedades abaixo sao necessarios para o protocolo smtp - nesse caso pegamos do mailtrap.io
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  default: {
    from: 'Equipe Gobarber <noreaply@gobarber.com>',
  },
};

/**
 * Serviços de envio de email:
 * Amazon SES
 * Mailgun
 * Sparkpost
 * Mandril(Mailchimp) -  so pode ser utilizado pra quem usa mailchimp
 * Nao e recomedavel utilizar o smtp do proprio Gmail pois ele tem um limite e ira nos bloquear futuramente
 * Utilizaremos o Mailtrap (ele so funciona em ambiente de desenvolvimento)
 */

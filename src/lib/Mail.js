import nodemailer from 'nodemailer';
import { resolve } from 'path';
import exphbs from 'express-handlebars';
import nodemailerhbs from 'nodemailer-express-handlebars';
import mailConfig from '../config/mail';

class Mail {
  constructor() {
    const { host, port, secure, auth } = mailConfig; // recebdno as informacoes contidas no mailconfig via desestruturacao

    this.transporter = nodemailer.createTransport({
      // transporter e a forma como o nodemail chama uma conexão com algum serviço externo
      host,
      port,
      secure,
      auth: auth.user ? auth : null, // fazendo a verificação se existe um user na autenticação, caso nao tenha iremos passar nulo.
    });

    this.configureTemplates();
  }

  configureTemplates() {
    // metodo para configuração dos templates dos emails
    const viewPath = resolve(__dirname, '..', 'app', 'views', 'emails'); // acessando o caminho da pasta onde ficarao os templates

    // iremos informar para a variavel transporter que ela deve usar o compilee o nodemailerhbs, todo o nodemailer-express-habdlebars age em cima do compile que e um metodod do nodemailer que e a forma que ele mostra os templates de email.
    this.transporter.use(
      'compile',
      nodemailerhbs({
        // dentro do nodemailer terao alguma configuracoes especificas abaixo:
        viewEngine: exphbs.create({
          // dentro do exphbs terao alguma configuracoes especificas abaixo:
          layoutsDir: resolve(viewPath, 'layouts'), //  estamos adicionando tbm a pasta layouts que esta no mesmo local do viewpath
          partialsDir: resolve(viewPath, 'partials'), // adicionando partials
          defaultLayout: 'default', // chamando o layout padrao de template
          extname: '.hbs', // informando a extensao dos arquivos que estamos utilizando
        }),
        viewPath,
        extName: '.hbs', // informando a extensao tbm.
      })
    );
  }

  // iremos criar o metodo para envio do email
  sendMail(message) {
    // recebemos o parametro que correponde a mensagem que vai ser enviada
    return this.transporter.sendMail({
      // criamos o metodo pois iremos enviar tudo que esta no default do mailConfig junto da mensagem que deve ser envada
      ...mailConfig.default,
      ...message,
    });
  }
}

export default new Mail();

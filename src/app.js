import 'dotenv/config';

import express from 'express';
import path from 'path'; // estamos importando o path do node
import * as Sentry from '@sentry/node'; // importando o sentry para monitorar os erros da aplicação
import Youch from 'youch';
import sentryConfig from './config/sentry';
import 'express-async-errors'; // deve ser importado antes das rotas

import routes from './routes';

import './database';

class App {
  constructor() {
    this.server = express();

    Sentry.init(sentryConfig);

    this.middlewares();

    this.routes();

    this.exceptionHandler(); // esse middleware ira tratar os erros da nossa aplicacao junto do sentry
  }

  middlewares() {
    this.server.use(Sentry.Handlers.errorHandler()); // copiamos a linha de condigo do sentry e alteramos para ser utilizada pelo server, esse linha deve vir antes de qualquer execução aplicação
    this.server.use(express.json());
    this.server.use(
      // estamos indicando que a rota /files ira utilizar o metodo express.static para acessar arquivos estaticvos
      '/files', // informando a rota /files
      express.static(path.resolve(__dirname, '..', 'tmp', 'uploads')) // path.resolve para passar o caminho dos arquivos, __dirname para informar o nome do diretorio e depois faça cada passo para acessar o diretorio
    );
  }

  routes() {
    this.server.use(routes);
    this.server.use(Sentry.Handlers.errorHandler()); // copiamos a linha de codigo de erro do sentry e alteramos para ser utilizada pelo server, esse linha deve ser executada depois de todos os itens da aplicação.
    // o Express nao consegue monitorar erros em funções assincronas e enviar para o Sentry, para corrigir execute o comando "yarn add express-async-errors" e depois importe ela nesse arquivo.
  }

  exceptionHandler() {
    // Esse middleware sera assincrono, e ele sera um middleware de tratamento de exceção, nos queremos que os erros caiam nele
    // iremos colocar o err como primeiro parametro do metodo async, quando um middleware tem 4 parametros ele sera reconhecido como tratamento de exceções
    this.server.use(async (err, req, res, next) => {
      // instale o youch - "yarn add youch", o youch faz uma tratativa das mensagens de erro para dar uma melhor visualização

      // verificando se a variavel ambiente env esta informando que estamos em ambiente de desenvolvimento para informar o erro detalhado na tela
      if (process.env.NODE_ENV === 'development') {
        const errors = await new Youch(err, req).toJSON(); // estamos utilizando o youch para receber o erro e armazenar na variavel errors

        return res.status(500).json(errors);
      }

      return res.status(500).json({ error: 'Internal server error' });
    });
  }
}
export default new App().server;

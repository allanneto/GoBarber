import Bee from 'bee-queue';
import redisConfig from '../config/redis';
import CancellationMail from '../app/jobs/CancellationMail';

const jobs = [CancellationMail]; // toda vez que tivermos um novo job ele deve ser importado aqui

class Queue {
  constructor() {
    // cadatipo de job tera uma fila so sua
    // email de cancelamento tera uma fila, alteracao de ssenha outra fila.
    this.queues = {};

    this.init();
  }

  init() {
    jobs.forEach(({ key, handle }) => {
      // estamos desestruturando de cada metodo o key e o handle
      // estamos passando o setando a chave dele com key de cada job e recebendo um novo Bee
      this.queues[key] = {
        // o bee poderia ser queue ou tanto faz, ele representa a nossa fila e o handle representa o handle presente em cada job
        bee: new Bee(key, {
          // estamos recebendo o bee queue que foi importado, o primeiro parametro sera key novamente e o segundo paramentro sera um obejto com algumas configuracoes
          redis: redisConfig, // estamos informando como parametro do redis o arquivo de configuracao que nada mais e do que o host e a porta do redis.
        }),
        handle, // o handle representa o processanmento do jobs
      };
    });
  }

  /**
   *
   *  Agora precisamos criar um metodo para adicionar um novos jobs dentro de cada fila, cada vez que eu novo em,ail for disparado ele dtem que ser adicionado a fila para ser processado.
   * para isso criaremos o metodo add
   */

  add(queue, job) {
    // recebdno o primeiro parametro para referenciar a qual fila deve ser adicionado o novo trabalho, e o metodo job para pegar as informacoes de cada job
    return this.queues[queue].bee.createJob(job).save(); // o parametro [queue] se refere a qual fila deve ser adicionado
    // o .bee representa a propriedade bee que representa a ila
    // o .createJob() e o metodo que recebe o parametro job onde contem os dados de cada job e depois .save() para salva novo item na fila.
  }

  /**
   * Agora iremos criar o metodo para processamento das filas.
   */

  proccessQueue() {
    jobs.forEach(job => {
      // percorrendo os jobs e recebendo eles mesmos para processa-los
      const { bee, handle } = this.queues[job.key]; // desestruturando o bee e o handle de cada job

      bee.on('failed', this.handleFailure).process(handle); // estamos selecionando a fila e processando com base no handle de cada job
      // o metodo on('failed') significa que ele fez todas as tentativas de exeucação e falhou no processo.
      // o this.handle.failure ira receber o metodo criado abaixo para informar que a execução falhou.
    });
  }

  handleFailure(job, err) {
    // iremos mostrar na tela o erro que ocorreu quando tentamos executar o job, primeiro parametro a mensagem segundo parametro o Erro.
    console.log(`Queue ${job.queue.name}: FAILED`, err);
  }
}

export default new Queue();

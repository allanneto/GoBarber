// aqui ficara toda a nossa parte de configuracao de upload da aplicação

import multer from 'multer';

import crypto from 'crypto';

import { extname, resolve } from 'path'; // extname retorna qual a extensao baseado no nome do arquivo, e resolve que percorre um caminho dentro da aplicacao.

export default {
  // storage sera como o multer ira guardar nossos arquivos de imagem
  storage: multer.diskStorage({
    destination: resolve(__dirname, '..', '..', 'tmp', 'uploads'), // Destino dos arquivos, devemos informar cada passo ate chegar ao arquivo com ','
    // o filename nao recebe uma string, mas sim uma funcao que ira formatar o nome de arquivo da imagem
    filename: (req, file, cb) => {
      crypto.randomBytes(16, (err, res) => {
        if (err) return cb(err);

        // caso nao de erro iremos retornar o metodo cb(), primeiro parametro sera null pq o cb entende como primeiro parametro o err;
        // no segundo paramentro sera o nome da imagem em si.
        // res para ser a resposta, toString para converter em string, o hex sera para informar que estamos convertendo 16 bits de conteudo aleatorio em hexadecimal;
        // e concatenando com o a extensao do arquivo original usando o extname.
        // Pode-se criar uma nova proriedade no enviromente junto com o base_url com o nome token que armazena o valor do token
        return cb(null, res.toString('hex') + extname(file.originalname));
      });
    },
  }),
};

import File from '../models/file';

class FileController {
  async store(req, res) {
    const { originalname: name, filename: path } = req.file; // estamos desestruturando as informacoes de orinalname e atribuindo a variavel name e filename e atribuindo a path

    const file = await File.create({
      // aqui estamos usando await para receber as requisicoes do usuario e depois criar esses dados no nosso bd
      name,
      path,
    });

    return res.json(file);
  }
}
export default new FileController();

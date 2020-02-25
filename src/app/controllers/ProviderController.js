import User from '../models/user';
import File from '../models/file';

class ProviderController {
  async index(req, res) {
    const providers = await User.findAll({
      where: { provider: true }, // parametro de busca dentro da DB, so retorno o que provider for true
      attributes: ['id', 'name', 'email', 'avatar_id'], // Estamos definindo os atributos que devem ser mostrados na tela.
      include: [
        // Importamos o arquivo File para ter acesso a todos as informacoes do arquivo orignal referente ao avatar do usuario
        {
          model: File,
          as: 'avatar', // renomeando File para avatar
          attributes: ['name', 'path', 'url'], // informando quais informacoes mostrar referentes ao model File com o nome avatar
        },
      ],
    });

    return res.json(providers);
  }
}

export default new ProviderController();

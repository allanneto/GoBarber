import Sequelize, { Model } from 'sequelize';

class File extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        path: Sequelize.STRING,
        url: {
          // estamos criando o campo url par o frontend conseguir acessar essa informacao
          type: Sequelize.VIRTUAL, // tipo virtual pois ele naoe existira no BD.
          get() {
            return `${process.env.APP_URL}/files/${this.path}`; // aqui estamos retornando a url de acesso para a imagem do avatar onde this.path se refere ao conteudo da propriedade path
          },
        },
      },
      {
        sequelize,
      }
    );
    return this;
  }
}

export default File;

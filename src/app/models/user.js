import Sequelize, { Model } from 'sequelize';
import bcrypt from 'bcryptjs';

class User extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        email: Sequelize.STRING,
        password: Sequelize.VIRTUAL,
        password_hash: Sequelize.STRING,
        provider: Sequelize.BOOLEAN,
      },
      {
        sequelize,
      }
    );
    this.addHook('beforeSave', async user => {
      if (user.password) {
        user.password_hash = await bcrypt.hash(user.password, 8);
      }
    });
    return this;
  }

  static associate(models) {
    // metodo de associacao que esta recebendo os models da aplicacao
    // no primeiro parametro do belongsTo recebemos qual model deve pertencer, e no segundo as configuracoes informando qual coluna que vai armazenar a referencia pro aarquivo
    this.belongsTo(models.File, { foreignKey: 'avatar_id', as: 'avatar' });
    // estamos usando o relacionamento belongsTo, que diz que esse model de usuario pertence a um model.file
    // estamos dando um codinome para esse models de 'avatar' utilizando o as:
  }

  checkPassword(password) {
    return bcrypt.compare(password, this.password_hash);
  }
}

export default User;

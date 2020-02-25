module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('appointments', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      date: {
        // estamos criando a coluna que armazena a data do appointment
        allowNull: false,
        type: Sequelize.DATE,
      },
      user_id: {
        // estou criando um relacionamento parecido com o que foi feito na outra migration
        type: Sequelize.INTEGER,
        references: { model: 'users', key: 'id' }, // estamos criando uma referencia/foreign key, iremos informar um objeto depois de references que contem o nome da tabela ex model: users, e a chave da tabela ex key: 'id', no final estamos dizendo que todo avatar_id contido na tabela users tbm sera um id contido na tabela users.
        onUpdate: 'CASCADE', // o que acontecera com o usuario que tem esse ID caso seja atualizado, devemos passar CASCADE para a alteracao tbm ocorrer na tabela user.
        onDelete: 'SET NULL', // vamos setar nulo para manter o historico dos appointments
        allowNull: true,
      },
      provider_id: {
        // estou criando um relacionamento parecido com o que foi feito na outra migration
        type: Sequelize.INTEGER,
        references: { model: 'users', key: 'id' }, // estamos criando uma referencia/foreign key, iremos ifnormar um objeto depois de references que contem o nome da tabela ex model: users, e a chave da tabela ex key: 'id', no final estamos dizendo que todo avatar_id contido na tabela users tbm sera um id contido na tabela users.
        onUpdate: 'CASCADE', // o que acontecera com o usuario que tem esse ID caso seja atualizado, devemos passar CASCADE para a alteracao tbm ocorrer na tabela user.
        onDelete: 'SET NULL', // vamos setar nulo para manter o historico dos appointments
        allowNull: true,
      },
      canceled_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  down: queryInterface => {
    return queryInterface.dropTable('appointments');
  },
};

// public async buscaCep(req: RequestSecure, res: Response) { try { let cep = req.body.cep var options = { method: 'GET', uri: "http://viacep.com.br/ws/" + cep + "/json/", }; let cepR = await rp(options); console.log(cepR) res.send(cepR);

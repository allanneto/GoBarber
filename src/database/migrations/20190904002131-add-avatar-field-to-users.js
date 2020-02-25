module.exports = {
  up: (queryInterface, Sequelize) => {
    // essa migration sera para criar uma nova coluna dentro da tabela de usuarios,
    // o primeiro parametro deve ser a tabela que desejamos inserir a coluna, o segundo o nome da coluna e no terceiro parametro iremos informar as informacoes da coluna!
    return queryInterface.addColumn('users', 'avatar_id', {
      type: Sequelize.INTEGER,
      references: { model: 'files', key: 'id' }, // estamos criando uma referencia/foreign key, iremos ifnormar um objeto depois de references que contem o nome da tabela ex model: files, e a chave da tabela ex key: 'id', no final estamos dizendo que todo avatar_id contido na tabela users tbm sera um di contido na tabela files.
      onUpdate: 'CASCADE', // o que acontecera com o usuario que tem esse ID caso seja atualizado, devemos passar CASCADE para a alteracao tbm ocorrer na tabela user.
      onDelete: 'SET NULL', // o que acontecera com o usuario que tem esse ID caso seja deletado, caso aconteca iremos setar ele como nulo
      allowNull: true,
    });
  },

  down: queryInterface => {
    return queryInterface.removeColunm('users', 'avatar_id'); // aqui iremos remover a coluna quando chamarmos o migrado undo.
  },
};

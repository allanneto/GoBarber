import Sequelize from 'sequelize';

import mongoose from 'mongoose';

import User from '../app/models/user';

import databaseConfig from '../config/database';

import File from '../app/models/file';

import Appointment from '../app/models/appointment';

const models = [User, File, Appointment];

class Database {
  constructor() {
    this.init();
    this.mongo();
  }

  init() {
    this.connection = new Sequelize(databaseConfig);

    models
      .map(model => model.init(this.connection))
      .map(model => model.associate && model.associate(this.connection.models)); // aqui estamos mapeando todos os models e chamando o model.associate e so executando caso ele exista.
  }

  mongo() {
    this.mongo.connection = mongoose.connect(
      process.env.MONGO_URL, // o mongo ira criar a base de dados automaticamente
      {
        useNewUrlParser: true,
        useFindAndModify: true,
      }
    );
  }
}

export default new Database();

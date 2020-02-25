import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

// Controllers
import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import authMiddleware from './app/middlewares/sessionAuth';
import FileController from './app/controllers/FileController';
import ProviderController from './app/controllers/ProviderController';
import AppointmentController from './app/controllers/AppointmentController';
import ScheduleController from './app/controllers/ScheduleController';
import NotificationController from './app/controllers/NotificationController';
import AvailableController from './app/controllers/AvailableController';

// rotas
const routes = new Router();

const upload = multer(multerConfig); //  estamos criando a variavel upload que vai utilizar o metodo multer com o parametro multerConfig

routes.get('/', (req, res) => {
  return res.json({ message: 'Hello Dev!' });
});

routes.post('/users', UserController.store);

routes.post('/session', SessionController.store);

routes.use(authMiddleware);

routes.put('/users', UserController.update);

routes.get('/providers', ProviderController.index);
routes.get('/providers/:providerId/available', AvailableController.index);

routes.get('/appointments', AppointmentController.index);
routes.post('/appointments', AppointmentController.store);
routes.delete('/appointments/:id', AppointmentController.delete);

routes.get('/schedule', ScheduleController.index);

routes.get('/notifications', NotificationController.index);
routes.put('/notifications/:id', NotificationController.update);

routes.post('/files', upload.single('file'), FileController.store); // estaremos utilizando o middleware upload.single que define que queremos fazer upload de 1 arquivo por vez  e o nome do campo que estarra na requisicao ex File.
// Ir no insomnia e testar essa req, trocando o corpo de json para multpartform, passar o token no auth pois o usuario so podera enviar o arquivo quando estiver logado.
// Toda vez que o multer esta agindo ele libera a variavel req.file(s), e de todas as informacoes contidas nessa variavel so nos interessa o originalName e o filename.

export default routes;

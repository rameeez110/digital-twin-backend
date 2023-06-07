import App from '@/app';
import { AuthController } from '@controllers/auth.controller';
import { IndexController } from '@controllers/index.controller';
import { UsersController } from '@controllers/users.controller';
import validateEnv from '@utils/validateEnv';
import { CommentsController } from './controllers/comment.controller';
import { FilterController } from './controllers/filter.controller';
import { InvitationController } from './controllers/invitation.controller';
import { PropertyController } from './controllers/property.controller';

validateEnv();

const app = new App([
  AuthController,
  IndexController,
  UsersController,
  FilterController,
  PropertyController,
  CommentsController,
  InvitationController
]);
app.listen();

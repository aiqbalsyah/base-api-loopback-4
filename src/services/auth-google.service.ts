import {repository} from '@loopback/repository';
import {OAuth2Client} from 'google-auth-library';
import {UserRepository} from '../repositories';

type PropResponse = {
  message: string;
  data: object | object[] | null;
  code: number;
};

class AuthGoogleService {
  private static clientId: string[] = [
    '547688133294-d6796j2jnlg52re5hu06u7lm2r4a4bpo.apps.googleusercontent.com',
    '547688133294-5mes9stlriso8hk7ed2i2s1e1h3olc6c.apps.googleusercontent.com',
  ];
  static userRepository: UserRepository;
  constructor(
    @repository(UserRepository) protected userRepository: UserRepository,
  ) { }

  static async getUserLogin({token}: {token: string}): Promise<PropResponse> {
    try {
      const client = new OAuth2Client();
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: this.clientId,
      });
      const payload = ticket.getPayload();
      if (payload?.sub == null) {
        throw new Error("TOKEN IS NO LONGER AVAILABLE");
      }

      var findUser = await this.userRepository.findOne({
        where: {email: payload?.email, }
      });
      if (!findUser) {
        var imageUrl = payload.picture;
        var password = Buffer.from(payload.email + '%' + token).toString('base64').substring(0, 100);

        findUser = await this.userRepository.create({
          'displayName': payload.name,
          'email': payload.email,
          'imageUrl': imageUrl,
          'status': 1,
          'password': password,
          'role': 'member',
        });
      }
      return {
        message: 'Success',
        data: findUser,
        code: 200
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

export default AuthGoogleService;

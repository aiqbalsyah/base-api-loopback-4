import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {securityId} from '@loopback/security';
import {ObjectId} from 'mongodb';
import {MonggoDbDataSource} from '../datasources';
import {User, UserRelations} from '../models';

export class UserRepository extends DefaultCrudRepository<
  User,
  typeof User.prototype.id,
  UserRelations
> {
  constructor(
    @inject('datasources.MonggoDB') dataSource: MonggoDbDataSource,
  ) {
    super(User, dataSource);
  }

  async getUserLogin(params: {currentUserProfile: any}): Promise<User> {
    const {currentUserProfile} = params;
    const userId: string = currentUserProfile[securityId];
    const objectIdUserId = new ObjectId(userId);
    const existingUser = await this.findById(objectIdUserId);
    if (!existingUser) {
      throw new HttpErrors.NotFound('User not found');
    }
    return existingUser;
  }

}

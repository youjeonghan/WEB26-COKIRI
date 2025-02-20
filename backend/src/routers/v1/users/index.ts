import { Request, Response } from 'express';
import { Controller, Req, Res, Get, Put, UseBefore, Redirect } from 'routing-controllers';
import * as passport from 'passport';

import { PostService, UserService, BlogService, NotifyService, FollowService } from 'src/services';
import { Authorization, ERROR, RESPONSECODE, Cursor } from 'src/utils';

@Controller('/users')
export default class UsersRouter {
  @Get('/')
  async getUsersValidUsername(@Req() request: Request, @Res() response: Response) {
    const { username, query } = request.query;
    if (!username && !query) {
      throw new Error(ERROR.WRONG_QUERY_TYPE);
    }
    let responseJSON;
    if (query) {
      if (typeof query !== 'string') {
        throw new Error(ERROR.WRONG_QUERY_TYPE);
      }
      responseJSON = await UserService.existsUserForUsername(query as string);
    }
    if (username) {
      if (typeof username !== 'string') {
        throw new Error(ERROR.WRONG_QUERY_TYPE);
      }
      const userProfile = await UserService.findOneUserProfileForUsername(username as string);
      const counts = await Promise.all([
        PostService.findPostCount(userProfile._id!),
        FollowService.countFollows(userProfile._id!),
        FollowService.countFollowers(userProfile._id!),
      ]);
      responseJSON = {
        ...userProfile,
        postCount: counts[0],
        followCount: counts[1],
        followerCount: counts[2],
      };
    }
    return response.json({ code: RESPONSECODE.SUCCESS, data: responseJSON });
  }

  @Get('/logout')
  @Redirect('/')
  getLogout(@Req() request: Request, @Res() response: Response) {
    response.cookie('jwt', '', Authorization.clearCookieOptions);
    return `${process.env.CLIENT_URL}`;
  }

  @Get('/me')
  @UseBefore(passport.authenticate('jwt', { session: false }))
  async getUsersMe(@Req() request: Request, @Res() response: Response) {
    const results = await Promise.all([
      UserService.findOneUserForID(request.user!.userID),
      FollowService.findFollowsID(request.user!.userID),
      FollowService.findFollowersID(request.user!.userID),
      BlogService.existsBlog(request.user!.userID),
    ]);
    const result = {
      ...results[0],
      follows: results[1],
      followers: results[2],
      hasExternalGithub: !!results[0].githubUsername,
      hasExternalBlog: results[3],
    };
    delete result.githubUsername;
    return response.json({ code: RESPONSECODE.SUCCESS, data: result });
  }

  @Get('/:userID/posts')
  async getUserPosts(@Req() request: Request, @Res() response: Response) {
    const { userID } = request.params;
    const cursorTemp = request.query.cursor;
    const cursor = Cursor.setCursor(cursorTemp as any);
    const { posts, postCount } = await PostService.findUserTimeline(userID, cursor);
    const data = Cursor.makeCursorData(posts, postCount, cursor);
    return response.json(data);
  }

  @Get('/:userID/settings')
  @UseBefore(passport.authenticate('jwt-registered', { session: false }))
  async getUserSetting(@Req() request: Request, @Res() response: Response) {
    const { userID } = request.params;
    if (userID !== request.user!.userID) {
      throw new Error(ERROR.PERMISSION_DENIED);
    }
    const userSettings = await UserService.findOneUserSettingForID(userID);
    return response.json({ code: RESPONSECODE.SUCCESS, data: userSettings });
  }

  @Get('/:userID/suggestions')
  @UseBefore(passport.authenticate('jwt-registered', { session: false }))
  async getUserSuggestions(@Req() request: Request, @Res() response: Response) {
    const { userID } = request.params;
    if (userID !== request.user!.userID) {
      throw new Error(ERROR.PERMISSION_DENIED);
    }
    const randomUserSuggestions = await UserService.findRandomUserSuggestions(userID);
    // @TODO 사용자 정보 기반 추천
    return response.json({ code: RESPONSECODE.SUCCESS, data: randomUserSuggestions });
  }

  @Get('/:userID/notifies')
  @UseBefore(passport.authenticate('jwt-registered', { session: false }))
  async getNotifyList(@Req() request: Request, @Res() response: Response) {
    const { userID } = request.params;
    const result = await NotifyService.findNotify(userID);
    return response.json({ code: RESPONSECODE.SUCCESS, data: result });
  }

  @Put('/:userID/settings')
  @UseBefore(passport.authenticate('jwt', { session: false }))
  async putUser(@Req() request: Request, @Res() response: Response) {
    const { userID } = request.params;
    if (userID !== request.user!.userID) {
      throw new Error(ERROR.PERMISSION_DENIED);
    }
    await UserService.updateOneUserConfig(request.user!.userID, request.body);
    return response.json({ code: RESPONSECODE.SUCCESS });
  }
}

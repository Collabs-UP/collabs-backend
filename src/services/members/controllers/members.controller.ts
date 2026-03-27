import { Controller, Delete, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { MembersService } from '../services/members.service';

@Controller('workspaces')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Delete(':workspaceId/members/:memberId')
  @HttpCode(HttpStatus.OK)
  async removeMember(
    @Param('workspaceId') workspaceId: string,
    @Param('memberId') memberId: string,
  ) {
    return this.membersService.removeMember(workspaceId, memberId);
  }
}
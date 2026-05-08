import { Controller, Get, Param } from '@nestjs/common';
import { StudentService } from './student.service.js';

@Controller('students')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get(':mssv')
  findOne(@Param('mssv') mssv: string) {
    return this.studentService.findOne(mssv);
  }
}

import bcrypt from 'bcrypt';
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, BeforeInsert } from 'typeorm';
import { Course } from './Course';
import { AppDataSource } from '..';


@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    firstName: string;

    @Column()
    middleName: string;

    @Column()
    lastName: string;

    @Column()
    email: string;

    @Column({ select: false })
    password: string;

    @Column('date', { nullable: true })
    dateOfBirth: Date;

    @Column({ nullable: true })
    gender: string;

    @Column({ nullable: true })
    address: string;

    @Column({ nullable: true })
    contactNumber: string;

    @Column({ nullable: true })
    parentGuardianName: string;

    @Column({ nullable: true })
    parentGuardianContact: string;

    @Column({ default: () => 'CURRENT_TIMESTAMP' })
    enrollmentDate: Date;

    @ManyToMany(() => Course, (course) => course.enrolledStudents, { cascade: true })
    @JoinTable()
    coursesEnrolled: Course[];

    @ManyToMany(()=>Course,(course)=>course.requestedStudent)
    @JoinTable()
    requestedCourses:Course[];

    @Column()
    paymentStatus: string;


    @BeforeInsert()
    async hashPassword() {
        this.password = await bcrypt.hash(this.password, 10);
    }

    async verifyPassword(password: string): Promise<boolean> {

        const userRepo = AppDataSource.getRepository(User);

        const user = await userRepo.findOne({
            where: {
                email: this.email
            },
            select: {
                password: true
            }
        })

        return await bcrypt.compare(password, user?.password!);
    }

}

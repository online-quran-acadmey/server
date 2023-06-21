import bcrypt from 'bcrypt';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, BeforeInsert } from 'typeorm';
import { Course } from './Course';
import { AppDataSource } from '..';

@Entity()
export class Tutor {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    middleName: string;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column()
    email: string;

    @Column()
    phoneNumber: string;

    @Column({ select: false })
    password: string;

    @Column()
    biography: string;

    @Column()
    specialization: string;

    @Column()
    gender:string;

    @Column('date')
    dateOfBirth:Date;

    @Column()
    idCard:string;

    @Column()
    address:string;


    @OneToMany(() => Course, course => course.tutor, { onDelete: 'CASCADE' })
    courses: Course[];

    @BeforeInsert()
    async hashPassword() {
        this.password = await bcrypt.hash(this.password, 10);
    }

    async verifyPassword(password: string): Promise<boolean> {
        const userRepository = AppDataSource.getRepository(Tutor);
        const user = await userRepository.findOne({
            where: {
                email: this.email
            },
            select: {
                password: true
            }
        })
        if (user) {
            return await bcrypt.compare(password, user.password);
        }
        return false;
    }
}

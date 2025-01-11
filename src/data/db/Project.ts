import { Entity } from 'dexie'
import AppDB from './AppDB';


export default class Project extends Entity<AppDB> {
  id!: number
  name!: string
  icon!: string
  diagramData!: string
  createdAt!: number
  updatedAt!: number
}
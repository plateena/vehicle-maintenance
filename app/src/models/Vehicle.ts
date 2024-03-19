import { Schema, Types } from 'mongoose'
import BaseModel, { IBaseModelOptions } from './BaseModel'

// Define the interface for the Vehicle document
export interface IVehicle {
    plateNumber: string
    color: string
    brand: string
    model: string
    year: number
    status: string
    maintenance?: Types.ObjectId | Record<string, unknown>
    _id?: Types.ObjectId
}

// Define the schema for the Vehicle collection
export const VehicleSchema = new Schema<IVehicle>({
    plateNumber: { type: String, required: true },
    color: { type: String, required: true },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    status: { type: String, required: true },
    maintenance: { type: Schema.Types.ObjectId, ref: 'Maintenance', required: false },
    // Add other fields as needed
})

const options: IBaseModelOptions = {
    allowedSorts: ['color', 'plateNumber'],
    defaultSort: 'plateNumber',
    populate: ['maintenance'],
    query: (query: any) => {
        const filters: any = {}
        if (query.filter) {
            for (const [key, value] of Object.entries(query.filter)) {
                if (['plateNumber', 'brand', 'model', 'color'].includes(key)) {
                    if (!Array.isArray(filters[key])) {
                        filters[key] = []
                    }
                    filters[key] = { $regex: new RegExp(value as unknown as string), $options: 'i' }
                }
                if (['year', 'status'].includes(key)) {
                    filters[key] = value
                }
            }
        }
        return filters
    },
}

export default BaseModel<IVehicle>('Vehicle', VehicleSchema, options)
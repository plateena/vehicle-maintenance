'use client'
import React, { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faSort,
    faSearch,
    faSortUp,
    faSortDown,
    faPlusCircle,
    faEdit,
    faTrash,
} from '@fortawesome/free-solid-svg-icons'
import Modal from '../Modal'
import MaintenanceForm from './form'
import { formatDateDifference, formatDate, debounce } from '../../util'
import ConfirmationModal from '../ConfirmModal'
import { apiConfig } from './../../config'

const MaintenanceList = ({ vehicleId, hideVehicle, hideActions }) => {
    const [maintenanceData, setMaintenanceData] = useState([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [searchPlate, setSearchPlate] = useState('')
    const [selectedMaintenanceId, setSelectedMaintenanceId] = useState(null)
    const [selectedVehicleId, setSelectedVehicleId] = useState(vehicleId)
    const [sort, setSort] = useState('asc')
    const [isConfirmationOpen, setIsConfirmationOpen] = useState(false)

    const fetchData = async () => {
        try {
            let url = `${apiConfig.url}/maintenance?populate=vehicle`
            if (vehicleId) url += `&filter[vehicle]=${vehicleId}`
            if (searchPlate) url += `&filter[vehiclePlateNumber]=${encodeURIComponent(searchPlate)}`
            if (sort) url += `&sort=${sort === 'asc' ? 'date' : '-date'}`
            const res = await fetch(url)
            const { data } = await res.json()
            setMaintenanceData(data)
            setLoading(false)
        } catch (error) {
            console.error('Error fetching maintenance data:', error)
            setLoading(false)
        }
    }

    const debouncedFetchMaintenance = debounce(fetchData, 500)

    useEffect(() => {
        setLoading(true)
        debouncedFetchMaintenance(searchPlate)
    }, [searchPlate, sort])

    const handleSort = () => {
        setSort((prevSort) => {
            if (prevSort === 'asc') return 'desc'
            if (prevSort === 'desc') return ''
            return 'asc'
        })
    }

    const openModal = () => setIsModalOpen(true)
    const closeModal = () => setIsModalOpen(false)

    const handleEdit = (maintenance) => {
        const { _id, vehicle } = maintenance
        setSelectedMaintenanceId(_id)
        const { _id: vehicleId } = vehicle
        setSelectedVehicleId(vehicleId)
        openModal()
    }

    const handleDelete = (maintenance) => {
        setSelectedMaintenanceId(maintenance._id)
        setIsConfirmationOpen(true)
    }

    const confirmDelete = async () => {
        try {
            const deleteEndpoint = `${apiConfig.url}/maintenance/${selectedMaintenanceId}`
            const response = await fetch(deleteEndpoint, {
                method: 'DELETE',
            })
            if (!response.ok) {
                throw new Error('Failed to delete maintenance')
            }
            setIsConfirmationOpen(false)
            fetchData()
        } catch (error) {
            console.log('Error deleting maintenance', error)
        }
    }

    return (
        <div className="container mx-auto">
            {vehicleId ? (
                <h2 className="font-bold my-6">
                    Maintenance List{' '}
                    <a
                        href="#"
                        onClick={() => {
                            setSelectedMaintenanceId(null)
                            openModal()
                        }}
                    >
                        <FontAwesomeIcon icon={faPlusCircle} size="sm" className="text-blue-500 hover:text-blue-700" />
                    </a>
                </h2>
            ) : (
                <h1 className="text-3xl font-bold my-6">Maintenance List</h1>
            )}
            {!hideVehicle && (
                <div className="flex items-center mb-4">
                    <FontAwesomeIcon icon={faSearch} className="text-gray-500 mr-2" />
                    <input
                        type="text"
                        placeholder="Search by Plate Number"
                        value={searchPlate}
                        onChange={(e) => setSearchPlate(e.target.value)}
                        className="border border-gray-300 px-3 py-2 rounded-md w-full max-w-md"
                    />
                </div>
            )}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {!hideVehicle && (
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Vehicle
                                </th>
                            )}
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                onClick={handleSort}
                                style={{ cursor: 'pointer' }}
                            >
                                Schedule Date {sort === 'asc' && <FontAwesomeIcon icon={faSortUp} />}
                                {sort === 'desc' && <FontAwesomeIcon icon={faSortDown} />}
                                {sort === '' && <FontAwesomeIcon icon={faSort} />}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Description
                            </th>
                            {!hideActions && (
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan={!hideActions ? 4 : 3} className="px-6 py-4 whitespace-nowrap text-center">
                                    Loading...
                                </td>
                            </tr>
                        ) : maintenanceData.length === 0 ? (
                            <tr>
                                <td colSpan={!hideActions ? 4 : 3} className="px-6 py-4 whitespace-nowrap text-center">
                                    No maintenance data found for this vehicle.
                                </td>
                            </tr>
                        ) : (
                            maintenanceData.map((item, index) => (
                                <tr key={index}>
                                    {!hideVehicle && item.vehicle && (
                                        <td className="px-6 py-4 whitespace-nowrap align-top">
                                            <div>
                                                <span className="text-lg font-bold">{item.vehicle.plateNumber}</span>{' '}
                                                <br />
                                                <span>
                                                    {item.vehicle.brand} - {item.vehicle.model}
                                                </span>{' '}
                                                <br />
                                                <span>
                                                    {item.vehicle.year} | {item.vehicle.color}
                                                </span>
                                            </div>
                                        </td>
                                    )}
                                    <td className="px-6 py-4 whitespace-nowrap align-top">
                                        <div>
                                            {formatDateDifference(item.date)} <br />
                                            <span className="text-gray-400 text-sm">{`(${formatDate(
                                                item.date
                                            )})`}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap align-top">
                                        Status: {item.status}
                                        <hr className="pb-2" />
                                        {item.description}
                                        <br />
                                    </td>
                                    {!hideActions && (
                                        <td className="px-6 py-4 whitespace-nowrap align-top text-center">
                                            <FontAwesomeIcon
                                                icon={faEdit}
                                                className="text-blue-500 hover:text-blue-700 cursor-pointer mr-2"
                                                size={'sm'}
                                                onClick={() => handleEdit(item)}
                                            />
                                            <FontAwesomeIcon
                                                icon={faTrash}
                                                className="text-red-500 hover:text-red-700 cursor-pointer"
                                                size={'sm'}
                                                onClick={() => handleDelete(item)}
                                            />
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <Modal isOpen={isModalOpen} onClose={closeModal}>
                <MaintenanceForm
                    reloadList={fetchData}
                    vehicleId={selectedVehicleId}
                    maintenanceId={selectedMaintenanceId}
                    closeModal={closeModal}
                />
            </Modal>

            <ConfirmationModal
                isOpen={isConfirmationOpen}
                onClose={() => setIsConfirmationOpen(false)}
                onConfirm={confirmDelete}
                message="Are you sure you want to delete this maintenance?"
            />
        </div>
    )
}

export default MaintenanceList
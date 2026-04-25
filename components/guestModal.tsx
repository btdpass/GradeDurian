import React from "react"

export default function GuestModal({showModal,setShowModal}){

    function closeModal(){
        localStorage.setItem("guestModal","true")
        setShowModal(false)
    }

    if (!showModal) return null

    return(
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40"
                onClick={closeModal}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
                    {/* Header */}
                    <div className="p-4 rounded-t-lg flex items-center justify-between">
                        <p className="dark:text-white p-1">Welcome to Guest Mode!</p>
                        <button
                            onClick={closeModal}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                    </div>

                    {/* Body */}
                    <div className="p-4 -mt-4">
                        <div>
                            <p className="dark:text-white text-md">In guest mode, you can manually input your scores and categories to help figure out your grade!</p>
                        </div>

                        <button
                            onClick={closeModal}
                            className="w-full rounded-lg bg-primary-500 text-white p-1 mt-5 hover:bg-primary-600 active:bg-primary-700"
                        >
                            {"Great, let's go!"}
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

import { useRouter } from "next/router";
import React, { useEffect, useState } from "react"
import { HiArrowCircleLeft, HiArrowCircleRight } from "react-icons/hi";

/*
TODO: 
    1. decide how to handle supression, how long, for who, how permenant. include secondary callout? 
    2. test integration with backend and vercel api 
    3. add pathway to the faq 
    4. integrate into React native app...



*/

export default function DonationModal({width,createError,donation,forceOpen,onForceClose,client}:any){
    const [showModal,setShowModal] = [false,(m)=>{}]
    const [view,setView] = useState("pls")
    const isMediumOrLarger = width >= 768;
    const [customDonation,setCustomDonation] = useState("5.00")
    const router = useRouter()

    const endpoint=""
 
    const campaignEnd=1773191212184;
    useEffect(()=>{
        if(forceOpen){
            setShowModal(true)
            setView("yes")
        }
    },[forceOpen])

    useEffect(()=>{
        if (router.query.session_id !== undefined || router.query.session_id2 !== undefined) {
            return
        }
        if(donation==undefined){return}
        if(localStorage.getItem("donationModal")!=null){
            const m = JSON.parse(localStorage.getItem("donationModal"))
            if(JSON.parse(localStorage.getItem("donationModal")).nxtTarget<=Date.now()&&Date.now()<campaignEnd&&!donation){
            setShowModal(true)
            }
        }else if(Date.now()<campaignEnd&&!donation){
            setShowModal(true)
        }

    },[donation])

    function closeModal(){
        localStorage.setItem("donationModal",JSON.stringify({seen:true,nxtTarget:(Date.now()+(Math.floor(Math.random()*4)+1)*1000*60*60*24)}))
        setShowModal(false)
        if(onForceClose) onForceClose()
    }


   async function donateMonthly(){

    const z=Number(customDonation)
    if(z<1||isNaN(z)){createError("Please enter a valid price");return}
try{
    const res = await fetch(endpoint+'/api/checkout_sessions', { method: 'POST',headers:{'content-type':'application/json'},body:JSON.stringify({price:z,district:client?.district ? new URL(client.district).host : '',username:client?.username || ''})})
    const data = await res.json()
    if (data.url) window.location.href = data.url
}catch(error){createError(error.message)}

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
            <div style={{marginRight:4,marginLeft:4}} className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
                    {/* Header */}
                    <div className="p-4 rounded-t-lg flex items-center justify-between">
                    <div className="flex gap-2">
                     {view!="pls" &&  <button className="text-gray-500 dark:text-white hover:text-gray-600 dark:hover:text-gray-300 active:text-gray-600 dark:active:text-gray-400"
                            onClick={()=>{
                                if(view=="yes"){setView("pls")}
                                else if(view=="monthly"){setView('yes')}
                            }}
                        >
                                  <HiArrowCircleLeft size={25}/>
                        </button>}

                        <p   className="dark:text-white p-1 text-xl font-semibold">Please consider donating!</p>
                        </div>
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
                            <p style={{fontSize:isMediumOrLarger ? 17 : 16}} className="dark:text-white  mb-2 md:mb-5">{`Grade Durian is not free to run! If you'd like to help keep Grade Durian ad-free and support this project, consider donating! Anything helps.`}</p>
                        </div>

         {           
            
             view=="pls" && <>
                        <button
                            onClick={async () => {
                                setView("yes")
                            }}
                            className="w-full rounded-lg bg-primary-500 text-white p-1 mt-5 hover:bg-primary-600 active:bg-primary-700 py-1.5"
                        >
                            {"I'd like to make a contribution"}
                        </button>
                            <button
                                onClick={closeModal}
                                className="w-full rounded-lg bg-gray-500 dark:bg-gray-600 text-white p-1 py-1.5 mt-5 hover:bg-gray-600 hover:dark:bg-gray-700 active:bg-gray-700"
                            >
                                {"Not this time"}
                        </button>
                        
                    </> }
            {
                view=="yes" && <>
                        <button
                            onClick={async () => {
                                try{
                                    const res = await fetch(endpoint+'/api/checkout_sessions', { method: 'POST',headers:{'content-type':'application/json'},body:JSON.stringify({district:client?.district ? new URL(client.district).host : '',username:client?.username || ''})})
                                    const data = await res.json()
                                    if (data.url) window.location.href = data.url
                                }catch(error){createError(error.message)}
                                }}
                            className="w-full rounded-lg bg-primary-500 text-white p-1 mt-5 hover:bg-primary-600 active:bg-primary-700 py-1.5"
                        >
                            {"I'd like to make a one-time contribution"}
                        </button>
                            <button
                                onClick={()=>{setView("monthly")}}
                                className="w-full rounded-lg bg-gray-500 dark:bg-gray-600 text-white p-1 py-1.5 mt-5 hover:bg-gray-600 hover:dark:bg-gray-700 active:bg-gray-700"
                            >
                                {"I'd like to give monthly"}
                        </button>
                    </>
                    }

                      {                        
                view=="monthly" && <>
                      <div>
                            <label
                                htmlFor="email"
                                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >
                                Monthly Donation (USD)
                            </label>
                            <div className="flex gap-2">
                             <input
                                type="number"
                                min={1}        
                                value={customDonation ?? ""}
                                onChange={(e) =>{
                                    if(e.target.value==""){setCustomDonation(null)}
                                    else{
                                        setCustomDonation(Number(e.target.value).toString())
                                    }
                                }}
                                onBlur={()=>{
                                    if(customDonation==null){
                                        setCustomDonation(" ")
                                    }
                                    else{
                                        if(Number(customDonation)<1){setCustomDonation(" ");createError("We cannot accept donations of less than $1")}
                                        else{setCustomDonation((Number(customDonation).toFixed(2)))}
                                    }
                                   
                                }
                            }
                                className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                placeholder={"5.00"}
                            />
                            </div>
                        </div>
                            <button
                                onClick={donateMonthly}
                                className="w-full rounded-lg bg-primary-500 dark:bg-primary-600 text-white p-1 py-1.5 mt-5 hover:bg-primary-600 hover:dark:bg-primary-700 active:bg-primary-700"
                            >
                                {"Donate $" +( Number(customDonation).toFixed(2) ?? " " )+ " monthly"}
                        </button>
                    </>
                    }

                   

                    </div>
                </div>
            </div>
        </>
    )
}

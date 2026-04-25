import React, { useState, useRef } from "react";

interface QuarterFieldProps {
    onChange: any;
    onBlur?:any;
    val:any
}

export default function QuarterField({onChange,val,onBlur=()=>{} }: QuarterFieldProps) {
    const grade=val;
    val=grade.raw
    const [focus, setFocus] = useState(false);
    const [valasString, setValasString] = useState(val.toString());
    const ref = useRef(null);
   

    const onFocus = async () => {
        setValasString(val.toString());
        await setFocus(true);
        await ref.current.focus();
    };

    const onUpdate = async (e) => {
        setValasString(e.target.value.replace("-","")
);
        await onChange(e);
    };

    async function onBlurFunc(e){
        await onBlur(e);
    }


    return (
        <div
            onClick={onFocus}
            onBlur={() => {
                setTimeout(()=>{
                    setFocus(false)
                },0);
                
            }}
            className="cursor-pointer"
        >
            {!focus ? (
                      <p 
                                style={{color:grade.color.includes("#") && grade.color,borderRadius:10,width:90,borderWidth:1,textOverflow:"ellipsis",overflow:"hidden",whiteSpace:"nowrap"}}
                                className={`text-center py-1 rounded-lg rounded-lg border-gray-500 font-bold text-${grade.color}-400`}>
                                    {grade.letter} {!Number.isNaN(grade.raw) && `(${grade.raw}%)`}
                                </p>
            ) : (
                <input
                    ref={ref}
                    type="number"
                    value={valasString}
                    onChange={onUpdate}
                    onBlur={(e)=>onBlurFunc(e)}
                    style={{...{borderRadius:10,width:90,textOverflow:"ellipsis"},color:grade.color.includes("#") && grade.color}}
                
                    className={`text-center py-1 rounded-lg bg-transparent focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-500 dark:focus:border-primary-500 hide-spinner text-${grade.color}-400`}
                />
            )}
        </div>

        
    );
}

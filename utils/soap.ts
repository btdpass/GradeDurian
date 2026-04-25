import {Grades,parseGrades} from "./grades"
import StudentVue,{Gradebook,Client} from "studentvue"



const url=""; //dw it'll get passed in


async function inital(params:ConstructorParameters<typeof Client>){

}






function stupid(client:Client,mp:any):Promise<[Gradebook,any]>{
  const clientIdentifier=client.district+client.username;
    try{
      return new Promise((res,rej)=>client.gradebook(mp.index,null,false).then(grades=>{res(grades)}).catch(error=>rej(error)))
    }catch(error){console.error("Gradebook fetch error:", error);
      return new Promise((res,rej)=>client.gradebook(mp.index,null,false).then(grades=>{res(grades)}).catch(error=>rej(error)))
    }
  
}




export async function getGradebooks(client:Awaited<ReturnType<typeof StudentVue.login>>["client"],lock,setLock):Promise<Gradebook[]>{
  
        //cacheLoading
        const result=await client.gradebook();
        //setLock(true); if we did a lazy loading implementation
        	const periods=result[0].reportingPeriod.available.map(({ name, index, date }) => ({
			name:name,
			date:date,
			index: index,
		}))

        
            const remainder:typeof result[]=await Promise.all(periods.map(mp=>{if(result[0].reportingPeriod.current.index==mp.index){return new Promise<typeof result>((res,rej)=>{res(result)})}else{return stupid(client,mp)}}))
        for(let extra of remainder.map(res=>res[1])){
            result[1]={...result[1],...extra}
        }
        const final=[result[0],...remainder.map(resp=>resp[0])]
        final[0].gradingScale=result[1].gradingScale //this is all dumb shi but I don't wanna do a refactor rn
        const extraData=result[1];
        return final
    }






//un-used unless I really commit to restructuring the underlying library which right now I don't wanna do
async function proxyAxios(xmls,params){
    const result = await (await fetch(url,{
        "headers":{
            "content-type":"application/json",
        },
        "method":"POST",
        "body":JSON.stringify(params)
    })).json()

    return result
}












/*

fuck all that shit.
You should always buidl the front end first.

    const client = new Client(
      {
        username: credentials.username,
        password: credentials.password,
        districtUrl: endpoint,
        isParent: credentials.isParent,
        encrypted:credentials.encrypted
      },
      proxyUrl,url
    );



class Client extends C{

    
    constructor(credentials: any, proxyUrl:string,hostUrl: string) {
    super(credentials,proxyUrl,hostUrl);
  }
        cache={gradebooks:undefined}
    


//function for that intial fetch at the beninging. 
public async getGradebooks(reportPeriods:[[number,string]]=[[null,undefined]]){ //error at this level will not be caught. Callers should be prepared to use .catch
    //client.gradebook reworked to just return the xml for the requests
    const xmls=reportPeriods.map(reportPeriod_OrgYear=>this.gradebook(reportPeriod_OrgYear[0][0],reportPeriod_OrgYear[1] != undefined ? reportPeriod_OrgYear[1] : null))

    //@ts-ignore
    const results=await this.gradebookFetch(xmls,true)
    const responses=results.responses
    const gradingScales=results.extraData.gradingScales
    const grades=responses.map((raw,i)=>this.gradebook.parse(raw,reportPeriods[i][0])) //gunna wanna rework the parsing logic in addition the actual restructuring. needs to be more robust. remove any chacne of runtime errors. use zod to attempt type coercsion. pray.
    grades.map(grade=>{grade.gradingScales=gradingScales;return grade})

    const parsedGrades:Grades[]=grades.map(grade=>parseGrades(grade))
    let cache={}
    for(let parsed of parsedGrades){
        cache[String(parsed.period.index)]=parsed;
    }
    this.cache.gradebooks=cache
    return parsedGrades;
}




 public async gradebookFetch(xmls:string[],getGradeScale=false){
    try{
    //@ts-ignore
    const results= await( await fetch(this.url+"/fulfillAxios",{
            headers:{"content-type":"application/json"},
            method:"POST",
            //@ts-ignore
            body:JSON.stringify({xmls:xmls,encrypted:this.encrypted,getGradeScale:getGradeScale,url:this.url})
        
        })).json()

    if(!results.status){throw new Error(results.message)}
    delete results.status;
    return results



    }catch(e){
        console.error("Proxy fetch failed:", e.message)
        throw new Error("proxy error")
    }
}
}


async function login(districtURL,credentials,proxyUrl){
    const client=new Client(credentials,proxyUrl,districtURL)
    let t = await client.getGradebooks()
    return [client,t]
}



export {Client,login}


*/
import React from 'react'
import Web3 from "web3";
import { useState, useEffect } from "react";
import { EMAILBLOCK } from "../abi/abi";
import forge from "node-forge";
import { SET_MAIL_CONTENT, SET_MAIL_SENDER} from './mailActions';
import  store from './store'


// Function to handle mouse leave







function Mailcard() {
  const [address, setaddress] = useState("");
  const [web3, setWeb3] = useState(null);
  const contractAddress = "0xDD883BAB25a50D499b5dD0D14A31a65863027647";
  const [contract, setContract] = useState(null);
  const [storedmails, setStoredMails] = useState([]);
  const [body, setBody] = useState("");
  const [decryptedMessages, setDecryptedMessages] = useState([]);

  var accounts;
  useEffect(() => {
    const fetchdata = async () => {
       const web3 = new Web3(window.ethereum);
        setWeb3(web3);
      await window.ethereum.enable();
      if (web3 && web3.eth) {
        const EmailContract = new web3.eth.Contract(EMAILBLOCK, contractAddress);
        setContract(EmailContract);
        const accounts = await web3.eth.getAccounts();
        setaddress(accounts[0]);
        // rest of your code
      } else {
        alert("web3 or web3.eth is not available");
      }

    };
    fetchdata();
    // console.log(address);
    // console.log(accounts);
  }, []);

  const getall = async () => {
    const accounts = await web3.eth.getAccounts();
    var storedmail = [];
    storedmail = await contract.methods.getEmails().call({ from: accounts[0] });
    setStoredMails(storedmail);
    console.log('Hi')
  };

  const changebody = async (_body, _issecure, _reciever) => {
    if (contract) {
      const accounts = await web3.eth.getAccounts();
      if (_issecure) {
        try {
          const privatekey = await contract.methods
            .getprivatekey()
            .call({ from: accounts[0] });
          const privateKey = forge.pki.privateKeyFromPem(privatekey);
          const encryptedMessage = forge.util.decode64(_body);
          const decryptedMessage = privateKey.decrypt(
            encryptedMessage,
            "RSA-OAEP",
            {
              md: forge.md.sha256.create(),
            }
          );
          var msg = decryptedMessage;
          return msg;
        } catch (error) {
          console.log(error);
          console.log("error detected");
        }
      } else {
        return _body;
      }
    }
  };

  const changetimestamp = (timestamp) => {
    const date = new Date(Number(timestamp) * 1000);
    const year = date.getFullYear();
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const day = ("0" + date.getDate()).slice(-2);
    return `${day}-${month}-${year}`;
  };




  useEffect(() => {
    const decryptMessages = async () => {
      const decryptedMessages = await Promise.all(
        storedmails.map((mail) =>
          changebody(mail.content, mail.isSecure, mail.sender)
        )
      );
      setDecryptedMessages(decryptedMessages);
    };
    decryptMessages();
  }, [storedmails]);


  const clicked=(newContent, newSender) => {
    console.log(newContent)
    try{
      store.dispatch({type:SET_MAIL_CONTENT, payload:newContent});
      store.dispatch({type:SET_MAIL_SENDER, payload:newSender});
    }catch(err)
    {
      console.log(err)
    }

  }



  return (
    <div>
      <div style={{width:'95%'}}><button  style={{ marginLeft:'10px',background:'#8952E0', padding:'7px'}}onClick={ getall}>Generate mails</button></div>
    {storedmails.map((mails, index) => (
    <div  key={index} >
      <button   onClick={()=>{clicked(mails.content,mails.sender)}}  id='mailcardbtn' style={{borderRadius:'5px', marginLeft:'10px', marginRight:'10px', padding:'20px', marginTop:'5px', border:'1px solid grey', textDecoration:'none', maxheight:'150px', width:'95%'}}  >
      <div style={{display:'flex', justifyContent:'space-between', alignContent:'center'}}>
        <span style={{fontSize:'16px', fontWeight:'bold', width:'40%', overflowX:'clip', textOverflow:'clip',  height:'22px',overflowY:'clip'}}>{mails.sender}</span>
        <span style={{fontSize:'12px'}}>                  {changetimestamp(mails.timestamp)}
</span>
      </div>
      <div style={{marginTop:'5px', textAlign:'left', height:'30px', textOverflow:'clip', overflowY:'clip'}}>
        <span style={{fontSize:'14px', textAlign:'left', textOverflow:'ellipsis', height:'40px'}}>{decryptedMessages[index]}
</span>
      </div>
      </button>
    </div>
    ))}
    </div>
 )
}

export default Mailcard
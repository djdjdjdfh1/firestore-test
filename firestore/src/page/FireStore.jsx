import React, { useEffect, useState } from 'react'
import { db } from '../database/firebase'
import { doc, collection, addDoc, getDocs, deleteDoc, updateDoc, where, query, Timestamp } from "firebase/firestore";

export default function FireStore() {
    const [datalist, setDatalist] = useState(); 
    
    const [title, setTitle] = useState();
    const [writer, setWriter] = useState();
    const [searchList, setSearchList] = useState();
    const [searchValue, setSearchValue] = useState();
    
    const [done, setDone] = useState(false);

    useEffect(()=>{
      getData();
    }, [])

    const getData = async() => {
      const querySnapshot = await getDocs(collection(db, "test"));
      let dataArray = [];
      querySnapshot.forEach((doc) => {
        dataArray.push({
          ...doc.data(),
          id: doc.id,
        })
        console.log(`${doc.id} => ${doc.data().title}`);
      });
      setDatalist(dataArray)
    }

    const addData = async(e) => {
        e.preventDefault();
        try {
            const docRef = await addDoc(collection(db, "test"), {
              title,
              writer,
              done,
              startDate: Timestamp.fromDate(new Date())
            });
            console.log("Document written with ID: ", docRef.id);
            setTitle("");
            setWriter("");
          } catch (e) {
            console.error("Error adding document: ", e);
          }
        getData();
    }

    const deleteList = async(id) => {
      await deleteDoc(doc(db, "test", id));
      getData();
    }
    
    const writeForm = (id) => {
      const feeling = prompt("느낀점을 입력하세요");
      updateList(id, feeling);
    }

    const updateList = async(id, feeling) => {
      await updateDoc(doc(db,"test",id), {
        memo : feeling,
        done : true,
        endDate : Timestamp.fromDate(new Date())
      });
      getData();
    }

    const onSearch = async() => {
      const q = query(collection(db, "test"),
        where("title", "==", searchValue));

      const querySnapshot = await getDocs(q);
      let dataArray = [];
      querySnapshot.forEach((doc) => {
        dataArray.push({
          id : doc.id,
          ...doc.data()
        })
      });
      setSearchList(dataArray);
      console.log(searchList)
    }

  return (
    <div style={{textAlign: "center"}}>
        <h2>Readingbooks 컬렉션</h2>
        <h1>책 추가</h1>
        <form onSubmit={addData}>
            <label htmlFor="">책 이름</label>
            <input type="text" 
            required 
            value={title}
            onChange={(e)=>{setTitle(e.target.value)}}
            />
            <br />
            <label htmlFor="">작가 이름</label>
            <input type="text" 
            required
            value={writer} 
            onChange={(e)=>{
              setWriter(e.target.value)
            }}
            />
            <br />
            <input type='submit' value="추가" />
        </form>
        <hr />
        <input type="text" onChange={(e)=>{setSearchValue(e.target.value)}} />
        <button onClick={ onSearch }>읽은 책 검색하기</button>
        
        <hr />
          {
            searchList && searchList.map((s, i)=>(
              <div key={i}> 
                <h3>
                  {s.startDate.toDate().getMonth()+1}/{s.startDate.toDate().getDate()} {s.title}
                </h3>
                <p>{s.memo ? s.memo : "메모없음"}</p>
              </div>
            ))
          }
        <hr />
        
        <ul>
          {
            datalist && datalist.map((data, i)=>(
              <div key={i}>
                <h3>
                  {data.startDate.toDate().getMonth()+1}/{data.startDate.toDate().getDate()} ~ 
                  {data.endDate ? (data.startDate.toDate().getMonth()+1)+"/"+data.startDate.toDate().getDate() : "읽는중"} {data.title}
                </h3>
                <p>{data.memo ? data.memo : ""}</p>
                
                {data.memo ? null : 
                <button 
                onClick={()=>{writeForm(data.id)}}
                >
                감상문 적기
                </button>}

                <button
                onClick={()=>{deleteList(data.id)}}
                >
                X
                </button>
              </div>
            ))
          }
        </ul>
    </div>
  )
}

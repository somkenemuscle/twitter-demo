"use client"
import React, { useState, useEffect } from "react";
import axios from 'axios';
import TweetContainer from "@/components/tweet/tweetContainer";
import '../styles/tweetcontainer.css';
import { useTweetContext } from "../context/TweetContext";
import NewTweet from "@/components/new/newTweet";
import { useUserContext } from '../context/userLog';


export default function Tweets() {
  //global state to check if user is logged in or not
  const { isLoggedIn, setIsLoggedIn } = useUserContext();
  //handling tweet state
  const [tweets, setTweets] = useState([]);
  const { tweetMessage, setTweetMessage } = useTweetContext();

  //get token and see if a user is loggged in 
  useEffect(() => {
    // Check if the token exists in localStorage
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);


  //fetching data-tweets from json api
  useEffect(() => {
    axios.get("http://localhost:4000/api/tweets")
      .then((res) => {
        setTweets(res.data);
      })
      .catch((error) => {
        console.error("Error fetching tweets:", error);
      });
  }, [tweets]);


  //add tweet to database function
  async function addTweet(tweet) {
    try {
      const token = localStorage.getItem('token');
      // Set the Authorization header with the JWT token
      const headers = {
        Authorization: `Bearer ${token}`
      };
      // Create FormData and append text and image (if present)
      const formData = new FormData();
      formData.append('text', tweet.text);
      formData.append('image', tweet.image ? tweet.image : null);
      await axios.post("http://localhost:4000/api/tweets/", formData, { headers }); // Pass headers as a third argument to axios.post()
      // Fetch updated tweets after successful addition
      const updatedTweetsResponse = await axios.get("http://localhost:4000/api/tweets");
      setTweets(updatedTweetsResponse.data); // Update local state with the updated tweets
      // Set flash message on successful tweet addition
      setTweetMessage('Tweet added');
    } catch (error) {
      console.log(error)
    }
  }

  //set tweet context to false so it dissappears
  const closeAlert = () => {
    setTweetMessage(false);
  };


  return (
    <div className="main-tweet-container">
      {/* let user know what has been added => flash message  */}
      {!!tweetMessage && (
        <div className="custom-alert alert alert-dark alert-dismissible fade show" role="alert">
          <strong>{tweetMessage}</strong>
          <button type="button" className="close" onClick={closeAlert}>
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
      )}

      {/* render create tweet form if user is logged in or not */}
      {isLoggedIn ? (
        <NewTweet addTweet={addTweet} />
      ) : null}


      <div className="tweet-container">
        {/* mapping through tweets and rendering them */}
        {tweets.map((newtweet, i) => (
          <TweetContainer
            id={newtweet._id}
            key={i}
            name={newtweet.author.name}
            username={newtweet.author.username}
            text={newtweet.text}
            url={newtweet.image.url}
            author_id={newtweet.author._id}
            time={newtweet.createdAt}
            profile_img={newtweet.author.profile_img.url}
            likes={newtweet.likes}
          />
        ))}
      </div>
    </div>

  );
}

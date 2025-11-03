"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export default function Home() {
  const { handleSubmit, register } = useForm();
  const [token, setToken] = useState(Object);
  const [playlist, setPlaylist] = useState(Object);

  // long useEffect that gets access token
  useEffect(() => {
    async function getToken(params: { name: string; id: string }) {
      const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        body: new URLSearchParams({
          grant_type: "client_credentials",
        }),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic " +
            Buffer.from(params.name + ":" + params.id).toString("base64"),
        },
      });
      return await response.json();
    }
    const fetchData = async () => {
      const result = await getToken({
        name: process.env.NEXT_PUBLIC_CLIENT_ID || "",
        id: process.env.NEXT_PUBLIC_CLIENT_SECRET || "",
      });
      setToken(result);
    };
    fetchData();
  }, []);

  const onSubmit = async (data: any) => {
    const playlistId = data.link.match(/playlist\/([a-zA-Z0-9]+)/)[1];
    console.log(token.access_token);

    const response = await axios
      .get(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        headers: {
          Authorization: `Bearer ${token.access_token}`,
        },
      })
      .then((response) => {
        const data = response.data;
        setPlaylist(data);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const getBpm = async (song: String, artist: String) => {
    const options = {
      method: "GET",
      url: "https://track-analysis.p.rapidapi.com/pktx/analysis",
      params: {
        song: "Respect",
        artist: "Aretha Franklin",
      },
      headers: {
        "x-rapidapi-key": "4a4f1d0c37msh37ed5dd8d3a45fap151f18jsnd6692bd9e266",
        "x-rapidapi-host": "track-analysis.p.rapidapi.com",
      },
    };

    try {
      const response = await axios.request(options);
      console.log(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="text-center p-3">
      <h1 className="text-2xl font-bold">Spotify Playlist Sorter</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-x-2">
          <input
            {...register("link")}
            className="border-2 rounded-md my-4"
            type="text"
            placeholder="Input your playlist link here"
          />
          <button type="submit" className="rounded-md bg-gray-200 p-1">
            Submit
          </button>
        </div>
      </form>

      {playlist.items.map((song: any) => {
        return <div key={song.id}>{song.track.name}</div>;
      })}
    </div>
  );
}

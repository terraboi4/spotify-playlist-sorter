"use client";

import axios from "axios";
import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export default function Home() {
  const { handleSubmit, register } = useForm();
  const [token, setToken] = useState<any>();
  const [playlist, setPlaylist] = useState<any>();
  const [bpms, setBpms] = useState<{ [trackId: string]: number }>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [hasFetchedBpms, setHasFetchedBpms] = useState<boolean>(false);

  // get token once
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

  // fetch BPMs by track id and only once per playlist load
  useEffect(() => {
    if (!playlist?.items || hasFetchedBpms) return;

    const fetchBpms = async () => {
      const ids = playlist.items.map((song: any) => song.track.id).join(",");
      try {
        const response = await axios.get(
          `https://api.reccobeats.com/v1/audio-features?ids=${ids}`,
          { headers: { Accept: "application/json" } }
        );

        // Map BPMs by track id (not by index)
        const bpmMap: { [trackId: string]: number } = {};
        response.data.content.forEach((item: any, idx: number) => {
          const trackId = playlist.items[idx].track.id;
          bpmMap[trackId] = Math.round(item.tempo);
        });

        setBpms(bpmMap);
        setHasFetchedBpms(true);
      } catch (error) {
        console.error(error);
      }
    };

    fetchBpms();
  }, [playlist, hasFetchedBpms]);

  const onSubmit = async (data: any) => {
    setLoading(true);
    setHasFetchedBpms(false); // reset so new playlist will fetch bpms
    setBpms({});

    try {
      const playlistId = data.link.match(/playlist\/([a-zA-Z0-9]+)/)[1];

      const response = await axios.get(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
        {
          headers: {
            Authorization: `Bearer ${token.access_token}`,
          },
        }
      );

      // keep the original playlist object shape Spotify returns
      setPlaylist(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const sortSongs = () => {
    if (!playlist?.items || Object.keys(bpms).length === 0) return;

    // capture original indices to use as a stable tiebreaker
    const originalIndexMap: { [trackId: string]: number } = {};
    playlist.items.forEach((item: any, idx: number) => {
      originalIndexMap[item.track.id] = idx;
    });

    // create a new array (don't mutate) and sort using bpm lookup by track id
    const sortedItems = [...playlist.items].sort((a: any, b: any) => {
      const aBpm = bpms[a.track.id] ?? Number.POSITIVE_INFINITY;
      const bBpm = bpms[b.track.id] ?? Number.POSITIVE_INFINITY;

      if (aBpm === bBpm) {
        // stable tiebreaker: original order
        return originalIndexMap[a.track.id] - originalIndexMap[b.track.id];
      }
      return aBpm - bBpm;
    });

    // keep the same playlist object shape
    setPlaylist({ ...playlist, items: sortedItems });
  };

  return (
    <div className="text-center p-3">
      <h1 className="text-2xl font-bold">Spotify Playlist Sorter</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-x-2 my-3">
          <input
            {...register("link")}
            className="input"
            type="text"
            placeholder="Input your playlist link here"
          />
          <button type="submit" className="btn btn-primary">
            {loading ? (
              <span className="loading loading-spinner loading-md"></span>
            ) : (
              "Submit"
            )}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!playlist}
            onClick={sortSongs}
          >
            <RefreshCw className="w-5 h-5" />
            Sort
          </button>
        </div>
      </form>

      <ul className="list bg-base-100 rounded-box shadow-md md:w-5/6 lg:w-3/4 mx-auto">
        {playlist &&
          playlist?.items?.map((song: any, i: number) => {
            return (
              <li className="list-row" key={song.track.id}>
                <div>
                  <img
                    className="size-10 rounded-box"
                    src={song.track.album.images[0].url}
                    alt={song.track.name}
                  />
                </div>
                <div>
                  <div>{song.track.name}</div>
                  <div className="text-xs uppercase font-semibold opacity-60">
                    {song.track.artists.map((artist: any, ai: number) => {
                      const len = song.track.artists.length;
                      return (
                        <span key={artist.id}>
                          {artist.name}
                          {len > 1 && ai < len - 1 ? ", " : ""}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="badge badge-primary">
                  BPM: {bpms[song.track.id] ?? "Loading..."}
                </div>
              </li>
            );
          })}
      </ul>
    </div>
  );
}

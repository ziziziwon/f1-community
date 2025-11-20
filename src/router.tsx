import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Home from "./pages/Home";
import Schedule from "./pages/Schedule";
import Results from "./pages/Results";
import Forum from "./pages/Forum";
import ForumThread from "./pages/ForumThread";
import Gallery from "./pages/Gallery";
import MediaDetailPage from "./pages/MediaDetailPage";
import MyTeam from "./pages/MyTeam";
import Login from "./pages/Login";
import Settings from "./pages/Settings";   
import MyPosts from "./pages/MyPosts";
import MyComments from "./pages/MyComments";
import MyMedia from "./pages/MyMedia"; 


export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: "schedule", element: <Schedule /> },
      { path: "results", element: <Results /> },

      { path: "forum", element: <Forum /> },
      { path: "forum/:id", element: <ForumThread /> },

      { path: "gallery", element: <Gallery /> },
      { path: "gallery/:id", element: <MediaDetailPage /> },

      { path: "my", element: <MyTeam /> },

      { path: "login", element: <Login /> },

      { path: "settings", element: <Settings /> },

      { path: "activity/posts", element: <MyPosts /> },
      { path: "activity/comments", element: <MyComments /> },
      { path: "activity/Media", element: <MyMedia /> },


    ],
  },
], {
  basename: "/apex",
});

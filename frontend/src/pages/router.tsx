import { createBrowserRouter } from "react-router";
import { MainMenu } from "./MainMenu/MainMenu";
import { Room } from "./Room/Room";
import { Game } from "./Game/Game";

const ROUTER = createBrowserRouter([
    {
        path: '/',
        element: <MainMenu/>
    },
    {
        path: '/room',
        element: <Room/>
    },
    {
        path: '/game',
        element: <Game/>
    }
]);

export default ROUTER;
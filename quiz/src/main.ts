import { bootstrapModule } from "@angular";
import { AppModule } from "./app-module";
import "./style.css";

bootstrapModule(AppModule).catch(err => {
    console.error('Failed to bootstrap application:', err);
});


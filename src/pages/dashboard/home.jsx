import React from "react";
import {
  Typography,
  Card,
  CardHeader,
  CardBody,
  IconButton,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Avatar,
  Tooltip,
  Progress,
} from "@material-tailwind/react";
import {
  EllipsisVerticalIcon,
  ArrowUpIcon,
} from "@heroicons/react/24/outline";
import { StatisticsCard } from "@/widgets/cards";
import { StatisticsChart } from "@/widgets/charts";
import {
  statisticsCardsData,
  statisticsChartsData,
  projectsTableData,
  ordersOverviewData,
} from "@/data";
import { CheckCircleIcon, ClockIcon } from "@heroicons/react/24/solid";

export function Home() {
  return (
    <div className="mt-1">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto py-12 px-4">
        <div className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold">Bienvenidos a Delicrem</h1>
          <div className="text-muted-foreground text-lg leading-relaxed">
            <p>
              Delicrem es una empresa familiar que se dedica a la elaboración de productos lácteos de alta calidad.
              Fundada hace más de 50 años, hemos logrado consolidarnos como una de las marcas más reconocidas en el
              mercado gracias a nuestro compromiso con la excelencia y la innovación.
            </p>
            <p className="mt-4">
              Nuestro equipo está conformado por un grupo de expertos en la industria láctea, quienes se encargan de
              seleccionar cuidadosamente los mejores insumos y aplicar técnicas de producción artesanales para garantizar
              la frescura y el sabor único de nuestros productos.
            </p>
          </div>
        </div>
        <div className="space-y-4">
          <img
          src="/img/imalogin.jpeg"
            alt="Imagen Delicrem"
            className="object-cover w-full h-full rounded-lg"
          />
         
        </div>
      </div>
    </div>
  );
}

export default Home;

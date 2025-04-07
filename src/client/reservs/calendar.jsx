import React, { useState, useEffect } from "react";
import moment from "moment";
import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "./calendar.css";
import { MoonLoader } from "react-spinners";
import EventModal from "./EventModal";
import Agregar from "./agregar_reserva";
import { toast } from "react-toastify";
const localizer = momentLocalizer(moment);
function CalendarComponent({ props, reserves, loading, cart }) {
  const [eventData, setEventData] = useState({
    event_type_id: "",
    date_in: "",
    date_out: "",
    num_people: 1,
  });
  const [eventos, setEventos] = useState(reserves);
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);

  useEffect(() => {
    setEventos(reserves);
  }, [reserves]);

  const MoverEventos = (data) => {
    const { start, end } = data;
    const updatedEvents = eventos.map((event) => {
      if (event.id === data.event.id) {
        return {
          ...event,
          start: new Date(start),
          end: new Date(end),
        };
      }
      return event;
    });
    setEventos(updatedEvents);
  };

  const handleEventClick = (evento) => {
    setEventoSeleccionado(evento);
  };

  const handleEventClose = () => {
    setEventoSeleccionado(null);
  };

  const eventStyleGetter = (event) => {
    let style = {
      borderRadius: "8px",
      padding: "5px",
      color: "#fff",
      border: "none",
      cursor: "pointer",
      transition: "0.3s",
    };

    if (event.color === "#00AD2B") {
      style = {
        ...style,
        border: "2px solid rgba(0, 180, 126, 0.699)",
        background: "rgba(0, 180, 126, 0.1)",
        color: "rgba(0, 180, 126, 0.9)",
        borderRadius: "10px",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        transition: "all 0.3s ease-in-out",
        boxShadow: "0 4px 10px rgba(0, 180, 126, 0.2)",
      };
    } else if (event.color === "#c42e0e") {
      style = {
        ...style,
        border: "2px solid rgba(196, 46, 14, 0.8)",
        background: "rgba(196, 46, 14, 0.1)",
        color: "rgba(196, 46, 14, 0.9)",
        borderRadius: "10px",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        transition: "all 0.3s ease-in-out",
        boxShadow: "0 4px 10px rgba(196, 46, 14, 0.2)",
      };
    }
    return { style };
  };

  const formatToLocalDatetime = (date) => {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };

  const setTime = (time) => {
    console.log(cart.products.length)
    if(cart.products.length == 0){
      toast.warning("Debes tener mínimo un producto en el carrito para reservar.")
      return
    }
    const localDatetime = formatToLocalDatetime(time);
    const newDate = new Date(localDatetime);
    const dateIn = new Date(eventData.date_in);
  
    if (!eventData.date_in || isNaN(dateIn.getTime())) {
      toast.info(`La hora de entrada ha sido actualizada a las: ${localDatetime}.`);
      setEventData({
        ...eventData,
        date_in: localDatetime,
      });
    } else if (newDate > dateIn) {
      toast.info(`La hora de salida ha sido actualizada a las: ${localDatetime}.`);
      setEventData({
        ...eventData,
        date_out: localDatetime,
      });
    } else {
      toast.info(`La hora de entrada ha sido actualizada a las: ${localDatetime}.`);
      setEventData({
        ...eventData,
        date_in: localDatetime,
      });
    }
  };  

  if (loading) {
    return (
      <div className="pantalla">
        <div className="client-loader">
          <MoonLoader color="#00B47E" size={50} speedMultiplier={0.8} />
        </div>
      </div>
    );
  }

  return (
    <div className="h-100 d-flex flex-column flex-md-row">
      <div className="d-flex col-12 col-md-3 p-3 p-md-0">
        <Agregar
          props={props}
          eventData={eventData}
          setEventData={setEventData}
        />
      </div>
      <div
        className="col-12 col-md-9 mx-auto overflow-auto"
        style={{ height: "80vh" }}
      >
        <Calendar
          defaultDate={moment().toDate()}
          defaultView="month"
          events={eventos}
          localizer={localizer}
          onDoubleClickEvent={() => alert("Probando")}
          onEventDrop={MoverEventos}
          onEventResize={MoverEventos}
          onSelectEvent={handleEventClick}
          onSelectSlot={(slotInfo) => setTime(slotInfo.start)}
          eventPropGetter={eventStyleGetter}
          selectable
          resizable
        />
      </div>
      {eventoSeleccionado && (
        <EventModal evento={eventoSeleccionado} onClose={handleEventClose} />
      )}
    </div>
  );
}

export default CalendarComponent;


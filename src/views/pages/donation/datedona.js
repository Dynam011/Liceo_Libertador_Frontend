import React from "react";

function DateDonation() {
  return (
    <div>
      <label htmlFor="dateInput" className="datedonation">Fecha de la donacion</label>
      <input type="date" id="dateInput" name="dateInput" />
    </div>
  );
}

export default DateDonation;

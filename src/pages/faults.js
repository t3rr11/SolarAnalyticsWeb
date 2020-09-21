import React, { Component }  from 'react';
import Error from '../modules/error';
import Loader from '../modules/loader';
import * as apiRequest from '../modules/api';
import * as Definitions from '../modules/Definitions';
import Misc from '../modules/misc';

export class Faults extends Component {

  state = {
    status: {
      status: 'startUp',
      statusText: 'Getting ready!',
      error: null,
      loading: true
    },
    data: { },
    timeframe: "today"
  }

  async componentDidMount() {
    this.setState({ status: { status: 'startingUp', statusText: `Getting Solar Analytics...`, loading: true } });
    this.GetAnalytics();
  }
  
  async GetAnalytics() {
    const solarData = (await apiRequest.GetMonthlyStatus()).data;

    //Status data from the SQL
    let today = solarData.filter(e => new Date(e.datetime) > Misc.GetDate(0, "day"));
    let hourly = solarData.filter(e => new Date(e.datetime) > Misc.GetDate(1, "hour"));
    let daily = solarData.filter(e => new Date(e.datetime) > Misc.GetDate(1, "day"));
    let weekly = solarData.filter(e => new Date(e.datetime) > Misc.GetDate(7, "day"));
    let monthly = solarData.filter(e => new Date(e.datetime) > Misc.GetDate(31, "day"));

    this.setState({
      status: { status: 'ready', statusText: `Finished Loading Analytics.`, loading: false },
      data: { today, hourly, daily, weekly, monthly }
    });
  }

  render () {
    const { data, timeframe } = this.state;
    const { status, statusText } = this.state.status;
    if(status === "error") { return (<Error statusText={ statusText } />) }
    else if(status === "ready") {
      console.log(data);
      return (
        <div className="page-content">
          <div className="faults-container">
            <div className="faults-table">
              <div className="faults-row">
                <div className="faults-column"><b>Voltage</b></div>
                <div className="faults-column"><b>Error Code</b></div>
                <div className="faults-column"><b>Error Description</b></div>
                <div className="faults-column"><b>Status Code</b></div>
                <div className="faults-column"><b>Status Description</b></div>
                <div className="faults-column"><b>Date</b></div>
              </div>
              {
                data[timeframe].filter(e => Definitions.GetDefinition("statusCode", e.status_code) !== "Startup" && e.error_code !== 0).map((e) => {
                  console.log(e);
                  return (
                    <div className="faults-row">
                      <div className="faults-column">{ e.ac_voltage }</div>
                      <div className="faults-column">{ e.error_code }</div>
                      <div className="faults-column">{ Definitions.GetDefinition("errorCode", e.error_code) }</div>
                      <div className="faults-column">{ e.status_code }</div>
                      <div className="faults-column">{ Definitions.GetDefinition("statusCode", e.status_code) }</div>
                      <div className="faults-column">{ new Date(e.datetime).toLocaleString("en-AU") }</div>
                    </div>
                  )
                })
              }
            </div>
          </div>
        </div>
      )
    }
    else { return (<Loader statusText={ statusText } />) }
  }
}

export default Faults;

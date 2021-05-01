import React, { Component }  from 'react';
import { XYPlot, XAxis, YAxis, VerticalGridLines, AreaSeries } from 'react-vis';
import Error from '../modules/error';
import Loader from '../modules/loader';
import * as apiRequest from '../modules/api';
import Misc from '../modules/misc';

export class Crypto extends Component {

  state = {
    status: {
      status: 'startUp',
      statusText: 'Getting ready!',
      error: null,
      loading: true
    },
    data: { },
    timeframe: "monthly"
  }

  async componentDidMount() {
    this.setState({ status: { status: 'startingUp', statusText: `Getting Crypto Information...`, loading: true } });
    this.GetRates();
  }
  
  async GetRates() {
    const nicehashRates = (await apiRequest.GetMonthlyRates()).data;
    //Status data from the SQL
    let today = nicehashRates.filter(e => new Date(e.date) > Misc.GetDate(0, "day"));
    let hourly = nicehashRates.filter(e => new Date(e.date) > Misc.GetDate(1, "hour"));
    let daily = nicehashRates.filter(e => new Date(e.date) > Misc.GetDate(1, "day"));
    let weekly = nicehashRates.filter(e => new Date(e.date) > Misc.GetDate(7, "day"));
    let monthly = nicehashRates.filter(e => new Date(e.date) > Misc.GetDate(31, "day"));

    this.setState({
      status: { status: 'settingGraphData', statusText: `Counting Coins...`, loading: true },
      data: { today, hourly, daily, weekly, monthly }
    });

    this.SetGraphData();
  }

  async SetGraphData() {
    let graph_data = {
      "today": this.GetGraphData("today"),
      "weekly": this.GetGraphData("weekly"),
      "monthly": this.GetGraphData("monthly"),
    };
    this.setState({ status: { status: 'ready', statusText: `Finished Counting Coins.`, loading: false }, graph_data });
  }

  GetGraphData(timeFrame) {
    var btc_fees = this.state.data[timeFrame].map(e => { return { x: new Date(e.date), y: e.btc_fee } });
    var btc_price = this.state.data[timeFrame].map(e => { return { x: new Date(e.date), y: e.btc_price } });

    return {
      btc_fees,
      btc_price
    }
  }

  render () {
    const { data, timeframe, graph_data } = this.state;
    const { status, statusText } = this.state.status;
    if(status === "error") { return (<Error statusText={ statusText } />) }
    else if(status === "ready") {
      return (
        <div className="page-content">
          <div className="fees-container">
            <div id="monthly_graph" className="graph-container">
              <div className="graph">
                <div className="graph-title">Fees (Monthly)</div>
                <XYPlot xType="time" width={ 600 } height={ 250 } margin={{ left: 60 }} >
                  <VerticalGridLines style={{ stroke: "#333333" }} />
                  <XAxis title="Time" />
                  <YAxis title="Fee" />
                  <AreaSeries data={ graph_data[timeframe].btc_fees } color={ "#ff7417" } fill={ "#885838" } opacity={ 0.9 } curve={'curveLinear'} />
                </XYPlot>
              </div>
            </div>
            <div id="daily_graph" className="graph-container">
              <div className="graph">
                <div className="graph-title">Fees (Daily)</div>
                <XYPlot xType="time" width={ 600 } height={ 250 } margin={{ left: 60 }} >
                  <VerticalGridLines style={{ stroke: "#333333" }} />
                  <XAxis title="Time" />
                  <YAxis title="Fee" />
                  <AreaSeries data={ graph_data["today"].btc_fees } color={ "#ff7417" } fill={ "#885838" } opacity={ 0.9 } curve={'curveLinear'} />
                </XYPlot>
              </div>
            </div>
            <div id="monthly_price_graph" className="graph-container">
              <div className="graph">
                <div className="graph-title">Monthly BTC Price (AUD)</div>
                <XYPlot xType="time" width={ 600 } height={ 250 } margin={{ left: 60 }} >
                  <VerticalGridLines style={{ stroke: "#333333" }} />
                  <XAxis title="Time" />
                  <YAxis title="Fee" />
                  <AreaSeries data={ graph_data[timeframe].btc_price } color={ "#00a6ef" } fill={ "#2d7a9c" } opacity={ 0.7 } curve={'curveLinear'} />
                </XYPlot>
              </div>
            </div>
            <div id="daily_price_graph" className="graph-container">
              <div className="graph">
                <div className="graph-title">Daily BTC Price (AUD)</div>
                <XYPlot xType="time" width={ 600 } height={ 250 } margin={{ left: 60 }} >
                  <VerticalGridLines style={{ stroke: "#333333" }} />
                  <XAxis title="Time" />
                  <YAxis title="Fee" />
                  <AreaSeries data={ graph_data["today"].btc_price } color={ "#00a6ef" } fill={ "#2d7a9c" } opacity={ 0.7 } curve={'curveLinear'} />
                </XYPlot>
              </div>
            </div>
            <div className="fees-table">
                <div className="fees-row">
                  <div className="fees-column"><b>Bitcoin Fee</b></div>
                  <div className="fees-column"><b>Bitcoin Price (AUD)</b></div>
                  <div className="fees-column"><b>Date</b></div>
                </div>
                {
                  data[timeframe].reverse().map((e) => {
                    console.log(e);
                    return (
                      <div className="fees-row">
                        <div className="fees-column">{ e.btc_fee } ( ${ (Math.round(e.btc_price) * e.btc_fee).toFixed(2) } )</div>
                        <div className="fees-column">${ Math.round(e.btc_price) }</div>
                        <div className="fees-column">{ new Date(e.date).toLocaleString("en-AU") }</div>
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

export default Crypto;

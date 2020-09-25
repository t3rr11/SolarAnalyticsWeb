import React, { Component }  from 'react';
import { XYPlot, XAxis, YAxis, VerticalGridLines, AreaSeries } from 'react-vis';
import Error from './error';
import Loader from './loader';
import * as apiRequest from '../modules/api';
import Misc from '../modules/misc';

export class Graph extends Component {

  state = {
    status: {
      status: 'startUp',
      statusText: 'Getting ready!',
      error: null,
      loading: true
    },
    data: { },
    graphData: [],
    selectedGraph: "today"
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
      status: { status: 'settingGraphData', statusText: `Defining X and Y Coordinates`, loading: false },
      data: { today, hourly, daily, weekly, monthly }
    });

    this.SetGraphData();
  }

  async SetGraphData() {

    let graph_data = {
      "today": this.GetGraphData("today"),
      "hourly": this.GetGraphData("hourly"),
      "daily": this.GetGraphData("daily"),
      "weekly": this.GetGraphData("weekly"),
      "monthly": this.GetGraphData("monthly"),
    };

    console.log(graph_data);

    this.setState({ status: { status: 'ready', statusText: `Finished Loading Analytics.`, loading: false }, graph_data });
  }

  GetGraphData(timeFrame) {
    var data = this.state.data[timeFrame];
    var generating = []
    var consuming = []
    var watts_used = 0;
    var paid_watts = 0;
    var sold_watts = 0;
    var daily_usage_kWh = 0;
    var daily_paid_usage_kWh = 0;
    var daily_sold_usage_kWh = 0;
    var daily_generated_kWh = 0;

    for(var i in data) {
      generating.push({ x: new Date(data[i].datetime), y: data[i].generating });
      consuming.push({ x: new Date(data[i].datetime), y: data[i].consumption + data[i].generating });
      watts_used += data[i].consumption + data[i].generating;
      paid_watts += data[i].consumption > 0 ? data[i].consumption : 0;
      sold_watts += data[i].consumption < 0 ? data[i].consumption : 0;
    }

    daily_usage_kWh = (watts_used / 1000) / ((new Date() - new Date(`${ new Date().getFullYear() }-${ new Date().getMonth()+1 }-${ new Date().getDate() }`)) / 1000 / 60 / 60).toFixed(2);
    daily_paid_usage_kWh = (paid_watts / 1000) / ((new Date() - new Date(`${ new Date().getFullYear() }-${ new Date().getMonth()+1 }-${ new Date().getDate() }`)) / 1000 / 60 / 60).toFixed(2);
    daily_sold_usage_kWh = (Math.abs(sold_watts / 1000)) / ((new Date() - new Date(`${ new Date().getFullYear() }-${ new Date().getMonth()+1 }-${ new Date().getDate() }`)) / 1000 / 60 / 60).toFixed(2);
    daily_generated_kWh = (data[data.length-1].total_energy_produced - data[0].total_energy_produced) / 1000;

    return {
      generating,
      consuming,
      watts_used,
      daily_usage_kWh,
      daily_paid_usage_kWh,
      daily_sold_usage_kWh,
      daily_generated_kWh
    }
  }

  render () {
    const { status, statusText } = this.state.status;
    if(status === "error") { return (<div className="graph"><Error statusText={ statusText } /></div>) }
    else if(status === "ready") {
      const { today, hourly, daily, weekly, monthly } = this.state.graph_data;
      return (
        <div className="graph-containers">
          <div id="daily_graph" className="graph-container">
            <div className="graph">
              <div className="graph-title">Daily Generation</div>
              <XYPlot xType="time" width={ 1200 } height={ 300 } margin={{ left: 60 }} >
                <VerticalGridLines style={{ stroke: "#333333" }} />
                <XAxis title="Time" />
                <YAxis title="Watts" />
                <AreaSeries data={ today.consuming } color={ "#ff7417" } fill={ "#885838" } opacity={ 0.9 } curve={'curveLinear'} />
                <AreaSeries data={ today.generating } color={ "#00a6ef" } fill={ "#2d7a9c" } opacity={ 0.7 } curve={'curveLinear'} />
              </XYPlot>
            </div>
            <div className="graph-data">
              <div>Daily Generation: { today.daily_generated_kWh.toFixed(2) } kWh</div>
              <div>Daily Usage: { today.daily_usage_kWh.toFixed(2) } kWh</div>
              <div>Daily Paid Usage: { today.daily_paid_usage_kWh.toFixed(2) } kWh ${ ((today.daily_paid_usage_kWh.toFixed(2) * 32) / 100).toFixed(2) } @ 32c/kWh</div>
              <div>Daily Solar Sold: { today.daily_sold_usage_kWh.toFixed(2) } kWh ${ ((today.daily_sold_usage_kWh.toFixed(2) * 16) / 100).toFixed(2) } @ 16c/kWh</div>
              <div>Total Daily Profit/Loss: ${ (((today.daily_sold_usage_kWh.toFixed(2) * 16) / 100) - ((today.daily_paid_usage_kWh.toFixed(2) * 32) / 100)).toFixed(2) }</div>
            </div>
          </div>
          <div id="weekly_graph" className="graph-container">
            <div className="graph">
              <div className="graph-title">Weekly Generation</div>
              <XYPlot xType="time" width={ 1200 } height={ 300 } margin={{ left: 60 }} >
                <VerticalGridLines style={{ stroke: "#333333" }} />
                <XAxis title="Time" />
                <YAxis title="Watts" />
                <AreaSeries data={ weekly.consuming } color={ "#ff7417" } fill={ "#885838" } opacity={ 0.9 } curve={'curveLinear'} />
                <AreaSeries data={ weekly.generating } color={ "#00a6ef" } fill={ "#2d7a9c" } opacity={ 0.7 } curve={'curveLinear'} />
              </XYPlot>
            </div>
            <div className="graph-data">
              <div>Daily Generation: { weekly.daily_generated_kWh.toFixed(2) } kWh</div>
              <div>Daily Usage: { weekly.daily_usage_kWh.toFixed(2) } kWh</div>
              <div>Daily Paid Usage: { weekly.daily_paid_usage_kWh.toFixed(2) } kWh ${ ((weekly.daily_paid_usage_kWh.toFixed(2) * 32) / 100).toFixed(2) } @ 32c/kWh</div>
              <div>Daily Solar Sold: { weekly.daily_sold_usage_kWh.toFixed(2) } kWh ${ ((weekly.daily_sold_usage_kWh.toFixed(2) * 16) / 100).toFixed(2) } @ 16c/kWh</div>
              <div>Total Daily Profit/Loss: ${ (((weekly.daily_sold_usage_kWh.toFixed(2) * 16) / 100) - ((weekly.daily_paid_usage_kWh.toFixed(2) * 32) / 100)).toFixed(2) }</div>
            </div>
          </div>
        </div>
      )
    }
    else { return (<div className="graph"><Loader statusText={ statusText } /></div>) }
  }
}

export default Graph;

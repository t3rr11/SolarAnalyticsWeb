import React, { Component }  from 'react';
import { XYPlot, XAxis, YAxis, VerticalGridLines, AreaSeries } from 'react-vis';
import Error from './error';
import Loader from './loader';
import * as apiRequest from '../modules/api';
import Misc from '../modules/misc';

let updateTimer = null;
let updateCountdown = null;

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
    intervalRate: {
      today: 1,
      weekly: 5,
      monthly: 10,
    },
    nextUpdate: new Date()
  }

  async componentDidMount() {
    this.setState({ status: { status: 'startingUp', statusText: `Getting Solar Analytics...`, loading: true } });
    this.GetAnalytics();

    //Set Interval of Refresh
    if(updateTimer === null) { updateTimer = setInterval(() => { this.setState({ nextUpdate: new Date().getTime() }); this.GetAnalytics(); }, 60000); }
    if(updateCountdown === null) { updateCountdown = setInterval(() => { this.setState({ nextUpdate: this.state.nextUpdate }) }, 1000); }

  }
  async componentWillUnmount() { clearInterval(updateTimer); updateTimer = null; clearInterval(updateCountdown); updateCountdown = null; }

  async GetAnalytics() {
    const solarData = (await apiRequest.GetMonthlyStatus()).data;

    //Status data from the SQL
    let today = solarData.filter(e => new Date(e.datetime) > Misc.GetDate(0, "day"));
    let weekly = solarData.filter(e => new Date(e.datetime) > Misc.GetDate(7, "day"));
    let monthly = solarData.filter(e => new Date(e.datetime) > Misc.GetDate(31, "day"));

    this.setState({
      status: { status: 'settingGraphData', statusText: `Defining X and Y Coordinates`, loading: false },
      data: { 
        today: today,
        weekly: weekly,
        monthly: monthly
      }
    });

    this.SetGraphData();
  }

  async SetGraphData() {
    let graph_data = {
      "today": this.GetGraphData("today"),
      "weekly": this.GetGraphData("weekly"),
      "monthly": this.GetGraphData("monthly"),
    };
    this.setState({ status: { status: 'ready', statusText: `Finished Loading Analytics.`, loading: false }, graph_data });
  }

  GetGraphData(timeFrame) {
    var data = this.state.data[timeFrame];
    var generating_data = [];
    var consuming_data = [];
    var ac_voltage_data = [];
    var watts_used = 0;
    var paid_watts = 0;
    var sold_watts = 0;

    var data5 = [];
    for(var i in data) {
      ac_voltage_data.push({ x: new Date(data[i].datetime), y: data[i].ac_voltage });
      //Since i am logging data every minute to avoid clouds from causing violent spikes in graph i am averaging data into 5 minute intervals.
      if(i % this.state.intervalRate[timeFrame] === 0) {
        //Push 5th dataset into data5 array
        console.log(data[i]);
        data5.push(data[i]);

        //Sort them into arrays
        var generating_array = data5.map(data => data.generating);
        var consumption_array = data5.map(data => data.consumption);

        //Then average them using reduce
        var generating = generating_array.reduce((sum, value) => { return sum + value }, 0) / generating_array.length;
        var consumption = consumption_array.reduce((sum, value) => { return sum + value }, 0) / consumption_array.length;

        //Push data to final array
        generating_data.push({ x: new Date(data[i].datetime), y: generating > 0 ? generating : 0 });
        consuming_data.push({ x: new Date(data[i].datetime), y: consumption + generating > 0 ? consumption + generating : 0 });
        watts_used += consumption + generating;
        paid_watts += consumption > 0 ? consumption : 0;
        sold_watts += consumption < 0 ? consumption : 0;
        
        //Empty data5
        data5 = [];
      }
      else { data5.push(data[i]); }
    }

    return {
      ac_voltage: ac_voltage_data,
      generating: generating_data,
      consuming: consuming_data,
      watts_used,
      paid_watts,
      sold_watts
    }
  }

  ChangeGraphInterval(graph, rate) {
    let intervalRate = this.state.intervalRate;
    intervalRate[graph] = rate;
    this.setState({ intervalRate });
    this.SetGraphData();
  }

  render () {
    const { status, statusText } = this.state.status;
    const intervalRate = this.state.intervalRate;
    if(status === "error") { return (<div className="graph"><Error statusText={ statusText } /></div>) }
    else if(status === "ready") {
      const { today, weekly, monthly } = this.state.graph_data;
      return (
        <div className="graph-containers">
          <div className="countdown-timer">Next Update: { 60 - Math.round((new Date().getTime() - new Date(this.state.nextUpdate).getTime()) / 1000) }s</div>
          <div id="daily_graph" className="graph-container">
            <div className="graph">
              <div className="graph-title">Daily Generation ({intervalRate.today}min Interval)</div>
              <XYPlot xType="time" width={ 1200 } height={ 250 } margin={{ left: 60 }} >
                <VerticalGridLines style={{ stroke: "#333333" }} />
                <XAxis title="Time" />
                <YAxis title="Watts" />
                <AreaSeries data={ today.consuming } color={ "#ff7417" } fill={ "#885838" } opacity={ 0.9 } curve={'curveLinear'} />
                <AreaSeries data={ today.generating } color={ "#00a6ef" } fill={ "#2d7a9c" } opacity={ 0.7 } curve={'curveLinear'} />
              </XYPlot>
            </div>
            <div className="graph-data">
              <div>Time Frame</div>
              <button onClick={ (() => this.ChangeGraphInterval("today", 1)) } value="Change to 1min">1m</button>
              <button onClick={ (() => this.ChangeGraphInterval("today", 5)) } value="Change to 5min">5m</button>
              <button onClick={ (() => this.ChangeGraphInterval("today", 10)) } value="Change to 10min">10m</button>
              <button onClick={ (() => this.ChangeGraphInterval("today", 30)) } value="Change to 10min">30m</button>
              <button onClick={ (() => this.ChangeGraphInterval("today", 60)) } value="Change to 10min">1hr</button>
            </div>
          </div>
          <div id="weekly_graph" className="graph-container">
            <div className="graph">
              <div className="graph-title">Weekly Generation ({intervalRate.weekly}min Interval)</div>
              <XYPlot xType="time" width={ 1200 } height={ 250 } margin={{ left: 60 }} >
                <VerticalGridLines style={{ stroke: "#333333" }} />
                <XAxis title="Time" />
                <YAxis title="Watts" />
                <AreaSeries data={ weekly.consuming } color={ "#ff7417" } fill={ "#885838" } opacity={ 0.9 } curve={'curveLinear'} />
                <AreaSeries data={ weekly.generating } color={ "#00a6ef" } fill={ "#2d7a9c" } opacity={ 0.7 } curve={'curveLinear'} />
              </XYPlot>
            </div>
            <div className="graph-data">
              <div>Time Frame</div>
              <button onClick={ (() => this.ChangeGraphInterval("weekly", 1)) } value="Change to 1min">1m</button>
              <button onClick={ (() => this.ChangeGraphInterval("weekly", 5)) } value="Change to 5min">5m</button>
              <button onClick={ (() => this.ChangeGraphInterval("weekly", 10)) } value="Change to 10min">10m</button>
              <button onClick={ (() => this.ChangeGraphInterval("weekly", 30)) } value="Change to 10min">30m</button>
              <button onClick={ (() => this.ChangeGraphInterval("weekly", 60)) } value="Change to 10min">1hr</button>
            </div>
          </div>
          <div id="monthly_graph" className="graph-container">
            <div className="graph">
              <div className="graph-title">Monthly Generation ({intervalRate.monthly}min Interval)</div>
              <XYPlot xType="time" width={ 1200 } height={ 250 } margin={{ left: 60 }} >
                <VerticalGridLines style={{ stroke: "#333333" }} />
                <XAxis title="Time" />
                <YAxis title="Watts" />
                <AreaSeries data={ monthly.consuming } color={ "#ff7417" } fill={ "#885838" } opacity={ 0.9 } curve={'curveLinear'} />
                <AreaSeries data={ monthly.generating } color={ "#00a6ef" } fill={ "#2d7a9c" } opacity={ 0.7 } curve={'curveLinear'} />
              </XYPlot>
            </div>
            <div className="graph-data">
              <div>Time Frame</div>
              <button onClick={ (() => this.ChangeGraphInterval("monthly", 1)) } value="Change to 1min">1m</button>
              <button onClick={ (() => this.ChangeGraphInterval("monthly", 5)) } value="Change to 5min">5m</button>
              <button onClick={ (() => this.ChangeGraphInterval("monthly", 10)) } value="Change to 10min">10m</button>
              <button onClick={ (() => this.ChangeGraphInterval("monthly", 30)) } value="Change to 10min">30m</button>
              <button onClick={ (() => this.ChangeGraphInterval("monthly", 60)) } value="Change to 10min">1hr</button>
            </div>
          </div>
          <div id="voltage_graph" className="graph-container">
            <div className="graph">
              <div className="graph-title">Daily Voltage ({intervalRate.today}min Interval)</div>
              <XYPlot xType="time" width={ 1200 } height={ 250 } margin={{ left: 60 }} >
                <VerticalGridLines style={{ stroke: "#333333" }} />
                <XAxis title="Time" />
                <YAxis title="Watts" />
                <AreaSeries data={ today.ac_voltage } color={ "#06bb00" } fill={ "#006300" } opacity={ 0.9 } curve={'curveLinear'} />
              </XYPlot>
            </div>
            <div className="graph-data">
              <div>Time Frame</div>
              <button onClick={ (() => this.ChangeGraphInterval("today", 1)) } value="Change to 1min">1m</button>
              <button onClick={ (() => this.ChangeGraphInterval("today", 5)) } value="Change to 5min">5m</button>
              <button onClick={ (() => this.ChangeGraphInterval("today", 10)) } value="Change to 10min">10m</button>
              <button onClick={ (() => this.ChangeGraphInterval("today", 30)) } value="Change to 10min">30m</button>
              <button onClick={ (() => this.ChangeGraphInterval("today", 60)) } value="Change to 10min">1hr</button>
            </div>
          </div>
        </div>
      )
    }
    else { return (<div className="graph"><Loader statusText={ statusText } /></div>) }
  }
}

export default Graph;

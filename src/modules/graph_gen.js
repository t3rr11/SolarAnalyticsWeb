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
    let weekly = solarData.filter(e => new Date(e.datetime) > Misc.GetDate(7, "day"));
    let monthly = solarData.filter(e => new Date(e.datetime) > Misc.GetDate(31, "day"));

    this.setState({
      status: { status: 'settingGraphData', statusText: `Defining X and Y Coordinates`, loading: false },
      data: { 
        today, today,
        weekly: weekly.filter((value, index, Arr) => { return index % 2 == 0 }),
        monthly: monthly.filter((value, index, Arr) => { return index % 6 == 0 })
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

    console.log(graph_data);

    this.setState({ status: { status: 'ready', statusText: `Finished Loading Analytics.`, loading: false }, graph_data });
  }

  GetGraphData(timeFrame) {
    var data = this.state.data[timeFrame];
    var generating_data = [];
    var consuming_data = [];
    var watts_used = 0;
    var paid_watts = 0;
    var sold_watts = 0;

    var data5 = [];
    for(var i in data) {
      //Since i am logging data every minute to avoid clouds from causing violent spikes in graph i am averaging data into 5 minute intervals.
      if(i % 5 == 0) {
        //Push 5th dataset into data5 array
        data5.push(data[i]);

        //Sort them into arrays
        var generating_array = data5.map(data => data.generating);
        var consumption_array = data5.map(data => data.consumption);

        //Then average them using reduce
        var generating = generating_array.reduce((sum, value) => { return sum + value }, 0) / generating_array.length;
        var consumption = consumption_array.reduce((sum, value) => { return sum + value }, 0) / consumption_array.length;

        //Push data to final array
        generating_data.push({ x: new Date(data[i].datetime), y: generating });
        consuming_data.push({ x: new Date(data[i].datetime), y: consumption + generating });
        watts_used += consumption + generating;
        paid_watts += consumption > 0 ? consumption : 0;
        sold_watts += consumption < 0 ? consumption : 0;
        
        
        //Empty data5
        data5 = [];
      }
      else { data5.push(data[i]); }
    }

    return {
      generating: generating_data,
      consuming: consuming_data,
      watts_used,
    }
  }

  render () {
    const { status, statusText } = this.state.status;
    if(status === "error") { return (<div className="graph"><Error statusText={ statusText } /></div>) }
    else if(status === "ready") {
      const { today, weekly, monthly } = this.state.graph_data;
      return (
        <div className="graph-containers">
          <div id="daily_graph" className="graph-container">
            <div className="graph">
              <div className="graph-title">Daily Generation (5min Interval)</div>
              <XYPlot xType="time" width={ 1200 } height={ 250 } margin={{ left: 60 }} >
                <VerticalGridLines style={{ stroke: "#333333" }} />
                <XAxis title="Time" />
                <YAxis title="Watts" />
                <AreaSeries data={ today.consuming } color={ "#ff7417" } fill={ "#885838" } opacity={ 0.9 } curve={'curveLinear'} />
                <AreaSeries data={ today.generating } color={ "#00a6ef" } fill={ "#2d7a9c" } opacity={ 0.7 } curve={'curveLinear'} />
              </XYPlot>
            </div>
            <div className="graph-data">
              <div>Data goes here:</div>
            </div>
          </div>
          <div id="weekly_graph" className="graph-container">
            <div className="graph">
              <div className="graph-title">Weekly Generation (10min Interval)</div>
              <XYPlot xType="time" width={ 1200 } height={ 250 } margin={{ left: 60 }} >
                <VerticalGridLines style={{ stroke: "#333333" }} />
                <XAxis title="Time" />
                <YAxis title="Watts" />
                <AreaSeries data={ weekly.consuming } color={ "#ff7417" } fill={ "#885838" } opacity={ 0.9 } curve={'curveLinear'} />
                <AreaSeries data={ weekly.generating } color={ "#00a6ef" } fill={ "#2d7a9c" } opacity={ 0.7 } curve={'curveLinear'} />
              </XYPlot>
            </div>
            <div className="graph-data">
              <div>Data goes here:</div>
            </div>
          </div>
          <div id="monthly_graph" className="graph-container">
            <div className="graph">
              <div className="graph-title">Monthly Generation (30min Interval)</div>
              <XYPlot xType="time" width={ 1200 } height={ 250 } margin={{ left: 60 }} >
                <VerticalGridLines style={{ stroke: "#333333" }} />
                <XAxis title="Time" />
                <YAxis title="Watts" />
                <AreaSeries data={ monthly.consuming } color={ "#ff7417" } fill={ "#885838" } opacity={ 0.9 } curve={'curveLinear'} />
                <AreaSeries data={ monthly.generating } color={ "#00a6ef" } fill={ "#2d7a9c" } opacity={ 0.7 } curve={'curveLinear'} />
              </XYPlot>
            </div>
            <div className="graph-data">
              <div>Data goes here:</div>
            </div>
          </div>
        </div>
      )
    }
    else { return (<div className="graph"><Loader statusText={ statusText } /></div>) }
  }
}

export default Graph;

import React, { Component }  from 'react';
import { XYPlot, XAxis, YAxis, HorizontalGridLines, LineSeries } from 'react-vis';
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
    const today_ago = Misc.GetDate(0, "day");
    const hour_ago = Misc.GetDate(1, "hour");
    const day_ago = Misc.GetDate(1, "day");
    const week_ago = Misc.GetDate(7, "day");
    const month_ago = Misc.GetDate(31, "day");

    //Status data from the SQL
    let today = solarData.filter(e => new Date(e.datetime) > today_ago);
    let hourly = solarData.filter(e => new Date(e.datetime) > hour_ago);
    let daily = solarData.filter(e => new Date(e.datetime) > day_ago);
    let weekly = solarData.filter(e => new Date(e.datetime) > week_ago);
    let monthly = solarData.filter(e => new Date(e.datetime) > month_ago);

    this.setState({
      status: { status: 'settingGraphData', statusText: `Defining X and Y Coordinates`, loading: false },
      data: { today, hourly, daily, weekly, monthly }
    });

    this.SetGraphData();
  }

  async SetGraphData() {
    var data = this.state.data[this.state.selectedGraph];
    var graph = [];

    for(var i in data) {
      graph.push({ x: new Date(data[i].datetime), y: data[i].generating });
    }

    this.setState({ status: { status: 'ready', statusText: `Finished Loading Analytics.`, loading: false }, graphData: graph });
  }

  render () {
    const { status, statusText, error } = this.state.status;
    const graphData = this.state.graphData;
    if(status === "error") { return (<div className="graph"><Error statusText={ statusText } /></div>) }
    else if(status === "ready") {
      return (
        <div className="graph-container">
          <div className="graph">
            <XYPlot xType="time" width={ 1200 } height={ 300 } margin={{ left: 60 }} >
              <HorizontalGridLines style={{ stroke: "#333333" }} />
              <XAxis title="X Axis" />
              <YAxis title="Y Axis" />
              <LineSeries data={ graphData } />
            </XYPlot>
          </div>
          <div className="graph-data-raw">{ JSON.stringify(this.state.data[this.state.selectedGraph]) }</div>
        </div>
      )
    }
    else { return (<div className="graph"><Loader statusText={ statusText } /></div>) }
  }
}

export default Graph;

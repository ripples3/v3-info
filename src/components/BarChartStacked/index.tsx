import React, { Dispatch, SetStateAction, ReactNode } from 'react';
import { Bar, BarChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import styled from 'styled-components';
import Card from 'components/Card';
import { RowBetween } from 'components/Row';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import useTheme from 'hooks/useTheme';
import { darken } from 'polished';
import { formatAmount, formatDollarAmount } from 'utils/numbers';
import getChartColor from '../../utils/getChartColor';
dayjs.extend(utc);

const DEFAULT_HEIGHT = 300;

const Wrapper = styled(Card)`
  width: 100%;
  height: ${DEFAULT_HEIGHT}px;
  padding: 1rem;
  padding-right: 2rem;
  display: flex;
  background-color: ${({ theme }) => theme.bg0}
  flex-direction: column;
  > * {
    font-size: 1rem;
  }
`;

const CustomBar = ({
    x,
    y,
    width,
    height,
    fill,
}: {
    x: number;
    y: number;
    width: number;
    height: number;
    fill: string;
}) => {
    return (
        <g>
            <rect x={x} y={y} fill={fill} width={width} height={height} rx="2" />
        </g>
    );
};

export type LineChartProps = {
    data: any[];
    color?: string | undefined;
    tokenSet: string[],
    height?: number | undefined;
    minHeight?: number;
    setValue?: Dispatch<SetStateAction<number | undefined>>; // used for value on hover
    setLabel?: Dispatch<SetStateAction<string | undefined>>; // used for label of valye
    value?: number;
    label?: string;
    topLeft?: ReactNode | undefined;
    topRight?: ReactNode | undefined;
    bottomLeft?: ReactNode | undefined;
    bottomRight?: ReactNode | undefined;
} & React.HTMLAttributes<HTMLDivElement>;

const BarChartStacked = ({
    data,
    color = '#56B2A4',
    tokenSet,
    value,
    label,
    setValue,
    setLabel,
    topLeft,
    topRight,
    bottomLeft,
    bottomRight,
    minHeight = DEFAULT_HEIGHT,
    ...rest
}: LineChartProps) => {
    const theme = useTheme();
    const parsedValue = value;

    return (
        <Wrapper minHeight={minHeight} {...rest}>
            <RowBetween>
                {topLeft ?? null}
                {topRight ?? null}
            </RowBetween>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    width={500}
                    height={300}
                    data={data}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                    onMouseLeave={() => {
                        setLabel && setLabel(undefined);
                        setValue && setValue(undefined);
                    }}
                >
                    <defs>
                        {tokenSet.map((el) => 
                        <linearGradient key={el + getChartColor(el, tokenSet.indexOf(el))} id={getChartColor(el, tokenSet.indexOf(el))} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={darken(0.36, getChartColor(el, tokenSet.indexOf(el)))} stopOpacity={0.5} />
                            <stop offset="100%" stopColor={getChartColor(el, tokenSet.indexOf(el))} stopOpacity={0} />
                        </linearGradient>
                        )}
                    </defs>
                    <XAxis
                        dataKey="time"
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(time) => dayjs(time).format('DD.MM.YY')}
                        minTickGap={10}
                    />
                    <YAxis 
                    allowDataOverflow={true} 
                    tickFormatter={(BAL) => formatDollarAmount(BAL)}
                    />
                    <Legend />
                    <Tooltip
                    contentStyle={{ backgroundColor: "#191B1F" }}
                    formatter={(value:number) => formatDollarAmount(value)}
                    labelFormatter={(time) => dayjs(time).format('DD.MM.YY')}
                    />
                   { tokenSet.map((el) => 
                    <Area key={el} stackId="1" dataKey={el} type="monotone" stroke={getChartColor(el, tokenSet.indexOf(el))} fill={"url(#" + getChartColor(el, tokenSet.indexOf(el)) + ")"} strokeWidth={2} />
                    )}
                </BarChart>
            </ResponsiveContainer>
            <RowBetween>
                {bottomLeft ?? null}
                {bottomRight ?? null}
            </RowBetween>
        </Wrapper>
    );
};

export default BarChartStacked;

import React, { Dispatch, ReactNode, SetStateAction } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import styled from 'styled-components';
import Card from 'components/Card';
import { RowBetween } from 'components/Row';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import useTheme from 'hooks/useTheme';
import { formatDollarAmount } from '../../utils/numbers';

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

export type PieChartProps = {
    data: any[];
    color?: string | undefined;
    height?: number | undefined;
    minHeight?: number;
    setValue?: Dispatch<SetStateAction<number | undefined>>; // used for value on hover
    setLabel?: Dispatch<SetStateAction<string | undefined>>; // used for label of value
    value?: number;
    label?: string;
    topLeft?: ReactNode | undefined;
    topRight?: ReactNode | undefined;
    bottomLeft?: ReactNode | undefined;
    bottomRight?: ReactNode | undefined;
} & React.HTMLAttributes<HTMLDivElement>;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export const BalPieChart = ({
    data,
    color = '#56B2A4',
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
}: PieChartProps) => {
    const theme = useTheme();
    const parsedValue = value;

    return (
        <Wrapper minHeight={minHeight} {...rest}>
            <RowBetween>
                {topLeft ?? null}
                {topRight ?? null}
            </RowBetween>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart width={400} height={400}>
                    <Pie
                        dataKey="value"
                        isAnimationActive={false}
                        data={data}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        //fill="#8884d8"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        cursor={{ stroke: theme.bg2 }}
                        formatter={(
                            value: number,
                            name: string,
                            props: { payload: { time: string; value: number } },
                        ) => {
                            if (setValue && parsedValue !== props.payload.value) {
                                setValue(props.payload.value);
                            }
                            const formattedTime = dayjs(props.payload.time).format('MMM D, YYYY');
                            if (setLabel && label !== formattedTime) setLabel(formattedTime);

                            return formatDollarAmount(value);
                        }}
                    />
                </PieChart>
            </ResponsiveContainer>
            <RowBetween>
                {bottomLeft ?? null}
                {bottomRight ?? null}
            </RowBetween>
        </Wrapper>
    );
};

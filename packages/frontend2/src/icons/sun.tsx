import { SvgIcon, type SvgIconProps } from './svg-icon'

export function SunIcon(props: SvgIconProps) {
  return (
    <SvgIcon width="24" height="24" viewBox="0 0 24 24" {...props}>
      <path d="M11.9875 0.78916C11.7756 0.792472 11.5736 0.87972 11.426 1.03176C11.2784 1.18379 11.1971 1.38819 11.2 1.6001V4.0001C11.1985 4.10611 11.2181 4.21136 11.2576 4.30973C11.2971 4.40811 11.3558 4.49764 11.4302 4.57314C11.5047 4.64863 11.5934 4.70858 11.6912 4.7495C11.789 4.79042 11.8939 4.81149 12 4.81149C12.106 4.81149 12.211 4.79042 12.3088 4.7495C12.4066 4.70858 12.4953 4.64863 12.5697 4.57314C12.6441 4.49764 12.7028 4.40811 12.7424 4.30973C12.7819 4.21136 12.8015 4.10611 12.8 4.0001V1.6001C12.8014 1.49307 12.7814 1.38683 12.7411 1.28768C12.7007 1.18852 12.6409 1.09847 12.5652 1.02286C12.4894 0.947239 12.3992 0.887594 12.3 0.847452C12.2008 0.80731 12.0945 0.787488 11.9875 0.78916ZM4.63747 3.83916C4.47845 3.83951 4.32315 3.88724 4.19139 3.97625C4.05962 4.06526 3.95736 4.19151 3.89767 4.3389C3.83798 4.48628 3.82356 4.64811 3.85625 4.80373C3.88894 4.95935 3.96726 5.10169 4.08122 5.2126L5.77809 6.90947C5.85181 6.98625 5.9401 7.04755 6.03781 7.08977C6.13551 7.132 6.24066 7.15431 6.34709 7.15539C6.45352 7.15647 6.5591 7.13631 6.65764 7.09607C6.75618 7.05584 6.8457 6.99635 6.92096 6.92109C6.99622 6.84583 7.05571 6.75631 7.09594 6.65777C7.13618 6.55923 7.15634 6.45365 7.15526 6.34722C7.15418 6.24078 7.13187 6.13564 7.08964 6.03794C7.04742 5.94023 6.98612 5.85194 6.90934 5.77822L5.21247 4.08135C5.13773 4.00452 5.04832 3.9435 4.94955 3.90189C4.85077 3.86029 4.74465 3.83896 4.63747 3.83916ZM19.3375 3.83916C19.1296 3.84535 18.9324 3.93222 18.7875 4.08135L17.0906 5.77822C17.0138 5.85194 16.9525 5.94023 16.9103 6.03794C16.8681 6.13564 16.8458 6.24078 16.8447 6.34722C16.8436 6.45365 16.8638 6.55922 16.904 6.65776C16.9442 6.7563 17.0037 6.84583 17.079 6.92109C17.1542 6.99635 17.2438 7.05584 17.3423 7.09607C17.4408 7.1363 17.5464 7.15647 17.6528 7.15539C17.7593 7.1543 17.8644 7.132 17.9621 7.08977C18.0598 7.04754 18.1481 6.98625 18.2218 6.90947L19.9187 5.2126C20.0343 5.10023 20.1133 4.95555 20.1452 4.79754C20.1772 4.63952 20.1607 4.47554 20.0979 4.32707C20.035 4.1786 19.9288 4.05257 19.7931 3.96551C19.6574 3.87845 19.4986 3.83441 19.3375 3.83916ZM12 6.4001C10.5148 6.4001 9.09037 6.9901 8.04017 8.0403C6.98997 9.0905 6.39997 10.5149 6.39997 12.0001C6.39997 13.4853 6.98997 14.9097 8.04017 15.9599C9.09037 17.0101 10.5148 17.6001 12 17.6001C13.4852 17.6001 14.9096 17.0101 15.9598 15.9599C17.01 14.9097 17.6 13.4853 17.6 12.0001C17.6 10.5149 17.01 9.0905 15.9598 8.0403C14.9096 6.9901 13.4852 6.4001 12 6.4001ZM1.59997 11.2001C1.49396 11.1986 1.38871 11.2182 1.29033 11.2577C1.19196 11.2972 1.10242 11.3559 1.02693 11.4304C0.951431 11.5048 0.891482 11.5935 0.850564 11.6913C0.809646 11.7891 0.788574 11.8941 0.788574 12.0001C0.788574 12.1061 0.809646 12.2111 0.850564 12.3089C0.891482 12.4067 0.951431 12.4954 1.02693 12.5698C1.10242 12.6443 1.19196 12.7029 1.29033 12.7425C1.38871 12.782 1.49396 12.8016 1.59997 12.8001H3.99997C4.10598 12.8016 4.21123 12.782 4.3096 12.7425C4.40798 12.7029 4.49751 12.6443 4.57301 12.5698C4.64851 12.4954 4.70845 12.4067 4.74937 12.3089C4.79029 12.2111 4.81136 12.1061 4.81136 12.0001C4.81136 11.8941 4.79029 11.7891 4.74937 11.6913C4.70845 11.5935 4.64851 11.5048 4.57301 11.4304C4.49751 11.3559 4.40798 11.2972 4.3096 11.2577C4.21123 11.2182 4.10598 11.1986 3.99997 11.2001H1.59997ZM20 11.2001C19.894 11.1986 19.7887 11.2182 19.6903 11.2577C19.592 11.2972 19.5024 11.3559 19.4269 11.4304C19.3514 11.5048 19.2915 11.5935 19.2506 11.6913C19.2096 11.7891 19.1886 11.8941 19.1886 12.0001C19.1886 12.1061 19.2096 12.2111 19.2506 12.3089C19.2915 12.4067 19.3514 12.4954 19.4269 12.5698C19.5024 12.6443 19.592 12.7029 19.6903 12.7425C19.7887 12.782 19.894 12.8016 20 12.8001H22.4C22.506 12.8016 22.6112 12.782 22.7096 12.7425C22.808 12.7029 22.8975 12.6443 22.973 12.5698C23.0485 12.4954 23.1085 12.4067 23.1494 12.3089C23.1903 12.2111 23.2114 12.1061 23.2114 12.0001C23.2114 11.8941 23.1903 11.7891 23.1494 11.6913C23.1085 11.5935 23.0485 11.5048 22.973 11.4304C22.8975 11.3559 22.808 11.2972 22.7096 11.2577C22.6112 11.2182 22.506 11.1986 22.4 11.2001H20ZM6.32809 16.8485C6.12025 16.8547 5.92299 16.9416 5.77809 17.0907L4.08122 18.7876C4.00444 18.8613 3.94315 18.9496 3.90092 19.0473C3.85869 19.145 3.83639 19.2502 3.8353 19.3566C3.83422 19.463 3.85439 19.5686 3.89462 19.6671C3.93485 19.7657 3.99434 19.8552 4.0696 19.9305C4.14486 20.0057 4.23439 20.0652 4.33293 20.1054C4.43147 20.1457 4.53704 20.1658 4.64348 20.1648C4.74991 20.1637 4.85505 20.1414 4.95275 20.0991C5.05046 20.0569 5.13875 19.9956 5.21247 19.9188L6.90934 18.222C7.02495 18.1096 7.1039 17.9649 7.13587 17.8069C7.16784 17.6489 7.15132 17.4849 7.08849 17.3364C7.02566 17.188 6.91944 17.0619 6.78375 16.9749C6.64806 16.8878 6.48924 16.8438 6.32809 16.8485ZM17.6484 16.8485C17.4893 16.8486 17.3337 16.8961 17.2017 16.985C17.0697 17.0739 16.9672 17.2001 16.9073 17.3475C16.8475 17.495 16.8329 17.657 16.8655 17.8127C16.8982 17.9685 16.9765 18.111 17.0906 18.222L18.7875 19.9188C18.8612 19.9956 18.9495 20.0569 19.0472 20.0991C19.1449 20.1414 19.25 20.1637 19.3565 20.1648C19.4629 20.1658 19.5685 20.1457 19.667 20.1054C19.7655 20.0652 19.8551 20.0057 19.9303 19.9305C20.0056 19.8552 20.0651 19.7657 20.1053 19.6671C20.1455 19.5686 20.1657 19.463 20.1646 19.3566C20.1635 19.2502 20.1412 19.145 20.099 19.0473C20.0568 18.9496 19.9955 18.8613 19.9187 18.7876L18.2218 17.0907C18.1473 17.0141 18.0581 16.9532 17.9596 16.9116C17.8612 16.87 17.7553 16.8485 17.6484 16.8485ZM11.9875 19.1892C11.7756 19.1925 11.5736 19.2797 11.426 19.4318C11.2784 19.5838 11.1971 19.7882 11.2 20.0001V22.4001C11.1985 22.5061 11.2181 22.6114 11.2576 22.7097C11.2971 22.8081 11.3558 22.8976 11.4302 22.9731C11.5047 23.0486 11.5934 23.1086 11.6912 23.1495C11.789 23.1904 11.8939 23.2115 12 23.2115C12.106 23.2115 12.211 23.1904 12.3088 23.1495C12.4066 23.1086 12.4953 23.0486 12.5697 22.9731C12.6441 22.8976 12.7028 22.8081 12.7424 22.7097C12.7819 22.6114 12.8015 22.5061 12.8 22.4001V20.0001C12.8014 19.8931 12.7814 19.7868 12.7411 19.6877C12.7007 19.5885 12.6409 19.4985 12.5652 19.4229C12.4894 19.3472 12.3992 19.2876 12.3 19.2474C12.2008 19.2073 12.0945 19.1875 11.9875 19.1892Z" />
    </SvgIcon>
  )
}

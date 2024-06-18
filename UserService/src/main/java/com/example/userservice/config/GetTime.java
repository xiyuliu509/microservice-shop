package com.example.userservice.config;

import java.text.SimpleDateFormat;
import java.util.Date;

public class GetTime {
    public static String NowTime() {
        SimpleDateFormat df = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        return df.format(new Date());
    }
}